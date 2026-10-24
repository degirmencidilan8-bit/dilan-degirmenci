import { redirect } from "next/navigation";

// The Archive has been taken out of the site: it showed the same
// photographs as Work. An old link to it lands on Work. The room itself
// (ArchiveRoom, data/archive.ts) is kept, unlinked, until it is decided
// whether it comes back in another form.
export default function ArchivePage() {
  redirect("/work");
}
