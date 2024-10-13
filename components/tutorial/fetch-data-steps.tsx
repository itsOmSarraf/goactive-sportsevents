import { TutorialStep } from "./tutorial-step";
import { CodeBlock } from "./code-block";
// import ServerNotes from './ServerNotes';
import ClientNotes from './ClientNotes';

export default function FetchDataSteps() {
  return (
    <ol className="flex flex-col gap-6">
      {/* ... other steps ... */}

      <TutorialStep title="Query Supabase data from Next.js">
        <p>
          Here's an example using a Server Component:
        </p>
        {/* <ServerNotes /> */}

        <p>And here's an example using a Client Component:</p>
        <ClientNotes />
      </TutorialStep>

      {/* ... other steps ... */}
    </ol>
  );
}