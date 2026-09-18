import { useParams } from 'wouter'
import { WorkshopShell } from '../components/WorkshopShell'
import { PhysicsWorkshop } from './workshops/Physics'
import { CADWorkshop } from './workshops/CAD'
import { ChemistryWorkshop } from './workshops/Chemistry'
import { ClimateWorkshop } from './workshops/Climate'

const workshopComponents: Record<string, React.ComponentType> = {
  physics: PhysicsWorkshop,
  cad: CADWorkshop,
  chemistry: ChemistryWorkshop,
  climate: ClimateWorkshop,
}

export function WorkshopPage() {
  const { slug } = useParams<{ slug: string }>()

  const WorkshopComponent = workshopComponents[slug || ''] || EmptyWorkshop

  return (
    <WorkshopShell workshopSlug={slug || ''}>
      <WorkshopComponent />
    </WorkshopShell>
  )
}

function EmptyWorkshop() {
  return (
    <div className="empty-workshop">
      <div className="empty-icon">?</div>
      <h2>Workshop not found</h2>
      <p>This workshop doesn't exist yet.</p>
      <style>{`
        .empty-workshop {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          gap: 1rem;
        }
        .empty-icon {
          font-size: 4rem;
          opacity: 0.3;
        }
        .empty-workshop h2 {
          font-size: 1.5rem;
          color: var(--text-secondary);
        }
      `}</style>
    </div>
  )
}
