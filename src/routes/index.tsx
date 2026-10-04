import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: Home })

function Home() {
  return (
    <main className="mx-auto max-w-280 px-7 py-7">
      <section className="max-w-187.5 pt-7 pb-8 min-[651px]:pt-12">
        <p className="text-[11px] font-bold tracking-[0.15em] text-[#38735e]">
          YOUR NEXT PROJECT STARTS HERE
        </p>
        <h1 className="my-5 text-[clamp(38px,6vw,64px)] leading-[1.08] font-bold tracking-[-0.045em]">
          From planning
          <br />
          to meaningful change.
        </h1>
        <p className="max-w-142.5 text-lg leading-[1.7] text-[#5c6e66]">
          A full-stack foundation for building with AI. Start with a clear need, verify behavior,
          and review the result.
        </p>
      </section>
      <section
        className="grid grid-cols-1 rounded-xl border border-[#d9e2db] bg-white min-[651px]:grid-cols-3"
        aria-label="Workflow"
      >
        <div className="px-6 py-4 min-[651px]:p-6">
          <b>01 / Plan</b>
          <p className="mt-3 text-sm leading-[1.6] text-[#5c6e66]">
            Write the goal and acceptance criteria.
          </p>
        </div>
        <div className="px-6 py-4 min-[651px]:p-6">
          <b>02 / Build</b>
          <p className="mt-3 text-sm leading-[1.6] text-[#5c6e66]">
            Keep each task focused on one branch.
          </p>
        </div>
        <div className="px-6 py-4 min-[651px]:p-6">
          <b>03 / Verify</b>
          <p className="mt-3 text-sm leading-[1.6] text-[#5c6e66]">
            Test, collect evidence, and review before merging.
          </p>
        </div>
      </section>
    </main>
  )
}
