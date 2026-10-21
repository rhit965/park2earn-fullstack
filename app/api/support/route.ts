import {authenticate,jsonBody,apiResponse,apiFailure,ApiError} from "@/lib/server/payments";
export const runtime="nodejs";
export async function POST(req:Request){try{
 const {db,user}=await authenticate(req,"support");const b=await jsonBody(req);
 if(!["booking","payment","privacy","complaint"].includes(b.category)||typeof b.subject!=="string"||typeof b.message!=="string"||b.subject.trim().length<3||b.subject.length>120||b.message.trim().length<10||b.message.length>4000)throw new ApiError("Enter a subject (3–120 characters) and message (10–4,000 characters).");
 const {data,error}=await db.from("support_requests").insert({user_id:user.id,category:b.category,subject:b.subject.trim(),message:b.message.trim()}).select("id,category,subject,message,status,created_at").single();
 if(error)throw new ApiError("Your request could not be saved. Please try again.",503);
 return apiResponse({ticket:data});
}catch(e){return apiFailure(e)}}
