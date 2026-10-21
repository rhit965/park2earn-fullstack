const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),ts=require('typescript'),{createHmac}=require('node:crypto');
function load(file,overrides={}){const mod={exports:{}};const code=ts.transpileModule(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;new Function('require','module','exports',code)(name=>name in overrides?overrides[name]:require(name),mod,mod.exports);return mod.exports;}
const rules=load('lib/payment-rules.ts');let count=0;async function check(name,fn){await fn();count++;console.log('PASS '+name);}
(async()=>{
 const secret='test-secret',body='order_123|pay_456',sig=createHmac('sha256',secret).update(body).digest('hex');
 await check('valid payment signature accepted',()=>assert.ok(rules.signatureValid(body,sig,secret)));
 await check('tampered order rejected',()=>assert.equal(rules.signatureValid('order_evil|pay_456',sig,secret),false));
 await check('tampered payment rejected',()=>assert.equal(rules.signatureValid('order_123|pay_evil',sig,secret),false));
 await check('wrong signing secret rejected',()=>assert.equal(rules.signatureValid(body,sig,'wrong'),false));
 await check('malformed signature rejected without throwing',()=>assert.equal(rules.signatureValid(body,'z'.repeat(64),secret),false));
 await check('short signature rejected without throwing',()=>assert.equal(rules.signatureValid(body,'ab',secret),false));
 await check('empty secret rejected',()=>assert.equal(rules.signatureValid(body,sig,''),false));
 const raw='{"event":"payment.captured"}';const webSig=createHmac('sha256',secret).update(raw).digest('hex');
 await check('webhook uses exact raw bytes',()=>{assert.ok(rules.signatureValid(raw,webSig,secret));assert.equal(rules.signatureValid(raw+' ',webSig,secret),false);});
 const order={gateway_order_id:'order_123',amount:12000,currency:'INR'},payment={status:'captured',order_id:'order_123',amount:12000,currency:'INR'};
 await check('captured matching payment accepted',()=>assert.ok(rules.capturedPaymentMatches(payment,order)));
 await check('authorised is not captured',()=>assert.equal(rules.capturedPaymentMatches({...payment,status:'authorized'},order),false));
 await check('partial amount rejected',()=>assert.equal(rules.capturedPaymentMatches({...payment,amount:100},order),false));
 await check('wrong currency rejected',()=>assert.equal(rules.capturedPaymentMatches({...payment,currency:'USD'},order),false));
 await check('other booking order rejected',()=>assert.equal(rules.capturedPaymentMatches({...payment,order_id:'order_other'},order),false));
 await check('non UUID input rejected',()=>assert.equal(rules.isUUID('not-a-booking'),false));
 const server=load('lib/server/payments.ts',{'../payment-rules':rules});
 process.env.PAYMENTS_ENABLED='true';process.env.RAZORPAY_KEY_ID='rzp_live_dummy';process.env.RAZORPAY_KEY_SECRET='dummy';
 await check('live credentials fail closed',()=>assert.throws(()=>server.paymentConfig(),/Live payment keys/));
 process.env.RAZORPAY_KEY_ID='rzp_test_dummy';
 await check('test credentials accepted',()=>assert.equal(server.paymentConfig().key,'rzp_test_dummy'));
 process.env.PAYMENTS_ENABLED='false';
 await check('disabled checkout fails closed',()=>assert.throws(()=>server.paymentConfig(),/not enabled/));
 await check('missing bearer rejected before database access',()=>assert.rejects(()=>server.authenticate(new Request('https://example.test'),'order'),/sign in/));
 await check('oversized request rejected',()=>assert.rejects(()=>server.jsonBody(new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:'x'.repeat(13000)})})),/too large/));
 await check('malformed JSON rejected',()=>assert.rejects(()=>server.jsonBody(new Request('https://example.test',{method:'POST',headers:{'Content-Type':'application/json'},body:'bad'})),/Invalid request/));
 // Exercise real route code with deterministic backend/gateway adapters; no network calls.
 const bookingId='11111111-1111-4111-8111-111111111111';let gatewayCalls=0,attached=0,rpcError=false,fresh=true;
 const db={rpc:async()=>rpcError?{error:{message:'denied'}}:{data:{fresh,payment:{id:'22222222-2222-4222-8222-222222222222',amount:12000,status:'created',gateway_order_id:fresh?null:'order_existing'}}},from:()=>({update:()=>({eq:()=>({eq:()=>({select:()=>({single:async()=>{attached++;return {data:{id:'x'}};}})})})})})};
 const mocked={...server,paymentConfig:()=>({key:'rzp_test_x'}),authenticate:async()=>({db,user:{id:'renter'}}),gateway:async(_path,b)=>{gatewayCalls++;assert.equal(b.amount,12000);return {id:'order_test',amount:12000,currency:'INR'};}};
 const route=load('app/api/payments/order/route.ts',{'@/lib/server/payments':mocked,'@/lib/payment-rules':rules});
 function req(overrides={}){return new Request('https://example.test/api/payments/order',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({bookingId,acceptTerms:true,termsVersion:rules.TERMS_VERSION,...overrides})});}
 await check('checkout rejects unchecked terms',async()=>assert.equal((await route.POST(req({acceptTerms:false}))).status,400));
 await check('checkout rejects outdated terms',async()=>assert.equal((await route.POST(req({termsVersion:'old'}))).status,400));
 await check('browser amount ignored; server amount used',async()=>{const r=await route.POST(req({amount:1}));assert.equal(r.status,200);assert.equal((await r.json()).amount,12000);assert.equal(attached,1);});
 await check('existing gateway order reused',async()=>{fresh=false;const before=gatewayCalls;const r=await route.POST(req());assert.equal((await r.json()).orderId,'order_existing');assert.equal(gatewayCalls,before);});
 await check('booking ownership/approval denial stops gateway',async()=>{rpcError=true;const before=gatewayCalls;assert.equal((await route.POST(req())).status,409);assert.equal(gatewayCalls,before);});
 console.log(`${count} payment security checks passed. External Razorpay and Supabase integration still needs sandbox testing.`);
})().catch(e=>{console.error(e);process.exit(1)});
