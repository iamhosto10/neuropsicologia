"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Leaf, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { Activity } from "@/lib/types";

const ActivityAccordion = ({ activity }: { activity: Activity }) => {
  const accordionItems = [
    {
      value: "item-1",
      title: "Beneficios de esta actividad",
      IconComponent: Leaf,
      iconColor: "text-[#22C55E]", // Vibrant Green
      content: activity?.benefits,
    },
    {
      value: "item-2",
      title: "Consejos para acompañar",
      IconComponent: Users,
      iconColor: "text-[oklch(var(--brand-mustard))]", // Mustard/Amber
      content: activity.advice,
    },
  ];
  return (
    <div className=" container p-6 lg:mx-auto lg:max-w-5xl max-w-5xl mx-auto w-full px-4 animate-in slide-in-from-bottom-8 fade-in duration-700">
      <Accordion
        type="single"
        collapsible
        className="w-full"
        defaultValue="item-1"
      >
        {accordionItems.map((item) => (
          <AccordionItem
            key={item.value}
            value={item.value}
            className="bg-white border border-gray-100 rounded-[2rem] mb-4 overflow-scroll"
          >
            <AccordionTrigger className="flex flex-row items-center justify-between w-full p-6 md:p-8 hover:no-underline">
              <div className="flex flex-row items-center gap-4">
                <item.IconComponent
                  className={cn("h-6 w-6 shrink-0", item.iconColor)}
                  aria-hidden="true"
                />
                <span className="text-lg font-extrabold text-gray-900 text-left">
                  {item.title}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="bg-white px-6 md:px-8 pb-8 pt-2">
              <div className="border-t border-gray-100 pt-6">
                <p className="text-base text-gray-700 leading-relaxed">
                  {item.content}
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ActivityAccordion;
