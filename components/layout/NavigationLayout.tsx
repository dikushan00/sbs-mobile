import { ReactElement } from "react"
import { FooterNav } from "./FooterNav"

export const NavigationLayout = ({children}: {children: ReactElement}) => {
  return <>
    {children}
    <FooterNav />
  </>
}