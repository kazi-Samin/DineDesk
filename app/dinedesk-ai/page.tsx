// app/dinedesk-ai/page.tsx
// Production DineDesk AI Discovery Page

import { Metadata } from "next";
import DineDeskAIView from "@/components/ai/DineDeskAIView";

export const metadata: Metadata = {
  title: "DineDesk AI — Real-Time Smart Restaurant & Dish Discovery",
  description:
    "Discover exquisite dining, chef-recommended dishes, and verified partner kitchens in real-time with DineDesk AI.",
};

export default function DineDeskAIPage() {
  return <DineDeskAIView />;
}
