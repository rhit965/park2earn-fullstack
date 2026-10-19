import type { Metadata } from "next";
import AppFrame from "@/components/AppFrame";
import "./globals.css";
export const metadata:Metadata={icons:{icon:"/favicon.svg"},title:{default:"Park2Earn — Make your idle time move",template:"%s | Park2Earn"},description:"A prototype hyperlocal vehicle-sharing marketplace. Discover rides, list vehicles and explore a smarter way to share mobility."};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppFrame>{children}</AppFrame></body></html>}
