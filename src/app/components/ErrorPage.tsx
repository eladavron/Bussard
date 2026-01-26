
interface ErrorPageProps {
  title: string;
  message: string;
  stack?: string;
}

export default function ErrorPage({ title, message, stack }: ErrorPageProps) {
    return (
        <main className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
      <header className="error-header">
          <h1>Error: {title}</h1>
      </header>
      <body>
        <div>
          <p>{message}</p>
          {stack && <pre>{stack}</pre>}
        </div>
      </body>
      </div>
    </main>
  );
}