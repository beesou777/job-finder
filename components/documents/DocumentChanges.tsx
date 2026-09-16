/** Linear comparison: show the changed block between a shared prefix/suffix.
 * This avoids an unbounded quadratic diff for very long imported documents. */
export function DocumentChanges({ before, after, baseline }: { before: string; after: string; baseline: string }) {
  if (before === after) return <p className="text-sm text-muted-foreground">No changes from {baseline} in this document.</p>;
  const previous = before.split('\n');
  const current = after.split('\n');
  let start = 0;
  while (start < previous.length && start < current.length && previous[start] === current[start]) start++;
  let end = 0;
  while (end < previous.length - start && end < current.length - start && previous[previous.length - 1 - end] === current[current.length - 1 - end]) end++;
  const removed = previous.slice(start, previous.length - end).join('\n');
  const added = current.slice(start, current.length - end).join('\n');
  return <div className="space-y-3">
    <p className="text-xs leading-5 text-muted-foreground">Comparing {baseline} with your current text. Shared opening and closing lines are hidden. Unchanged lines between separate edits may appear in both blocks.</p>
    <div className="grid gap-3 sm:grid-cols-2">
      <section className="min-w-0 rounded-lg border border-border p-3"><h4 className="mb-2 text-sm font-semibold">Before · {baseline}</h4><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6">{removed || '(No text)'}</pre></section>
      <section className="min-w-0 rounded-lg border border-border bg-secondary/50 p-3"><h4 className="mb-2 text-sm font-semibold">After · current editor</h4><pre className="max-h-80 overflow-auto whitespace-pre-wrap break-words font-sans text-sm leading-6">{added || '(No text)'}</pre></section>
    </div>
  </div>;
}
