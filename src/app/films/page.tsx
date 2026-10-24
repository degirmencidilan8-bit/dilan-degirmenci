import { redirect } from "next/navigation";

// Films are a filter of the Work index now, not a page of their own. Old
// links to /films land on the films.
export default function FilmsPage() {
  redirect("/work?filter=films");
}
