import { redirect } from "next/navigation";

// The Archive has been taken out of the site: it showed the same
// photographs as Work. An old link to it lands on Work.
export default function ArchivePage() {
  redirect("/work");
}
