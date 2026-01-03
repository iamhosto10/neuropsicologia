import ActivityAccordion from "@/components/activity-detail/activity-accordion";
import ActivityOverview from "@/components/activity-detail/activity-overview";
import { InstructionsList } from "@/components/activity-detail/instructions-list";
import RelatedActivities from "@/components/activity-detail/related-activities";

const page = () => {
  return (
    <>
      <ActivityOverview />
      <InstructionsList />
      <ActivityAccordion />
      <RelatedActivities />
    </>
  );
};

export default page;
