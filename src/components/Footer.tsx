'use client';

export default function Footer() {
  return (
    <footer>
      <div className="mt-10 text-center text-sm text-secondary">
        <span>&copy; {new Date().getFullYear()} My Movie Collection</span>
      </div>
    </footer>
  );
}
