import ActivityOverview from "@/components/activity-detail/activity-overview";
import { InstructionsList } from "@/components/activity-detail/instructions-list";
import React from "react";

const page = () => {
  return (
    <>
      <ActivityOverview />
      <InstructionsList />
    </>
  );
};

export default page;
