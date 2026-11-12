import MotionGraphic from '../../shared/motion/MotionGraphic';
import { ArrowUpRight } from 'lucide-react';
export default function NotFoundPage() {
  return (
    <section className="vw-page vw-not-found page-shell">
      <div className="vw-error-number" aria-hidden="true">
        404
        <MotionGraphic variant="not-found" />
      </div>
      <div className="vw-error-copy">
        <h1>A WRONG TURN.</h1>
        <p>
          This page may have moved, or the address may be incorrect. The wallpaper collection is
          right here.
        </p>
        <a className="btn btn--primary vw-button" href="/">
          Back to the collection
          <ArrowUpRight size={22} />
        </a>
      </div>
    </section>
  );
}
