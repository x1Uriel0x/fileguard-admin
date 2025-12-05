import type { Role } from '../types';
import Icon from '../../../components/AppIcon';

interface RoleSelectionCardProps {
  role: Role;
  selected: boolean;
  onClick: () => void;
}

const RoleSelectionCard = ({ role, selected, onClick }: RoleSelectionCardProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        w-full p-4 rounded-lg border-2 transition-all duration-200 text-left
        ${
          selected
            ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50 bg-card'
        }
      `}
    >
      <div className="flex items-start gap-3">
        <div
          className={`
          w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
          ${selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}
        `}
        >
          <Icon
            name={role.value === 'admin' ? 'Shield' : 'User'}
            size={20}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-foreground">{role.label}</h3>
            {selected && (
              <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Icon name="Check" size={14} color="white" />
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {role.description}
          </p>
        </div>
      </div>
    </button>
  );
};

export default RoleSelectionCard;