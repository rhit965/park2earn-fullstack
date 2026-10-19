"use client";
import type {ReactNode} from "react";
import { DemoProvider } from "@/lib/store";
import Header from "./Header";
import Footer from "./Footer";
export default function AppFrame({children}:{children:ReactNode}){return <DemoProvider><Header/><main>{children}</main><Footer/></DemoProvider>}
