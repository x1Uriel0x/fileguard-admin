import type { PasswordStrength } from '../types';

interface PasswordStrengthIndicatorProps {
  strength: PasswordStrength;
}

const PasswordStrengthIndicator = ({ strength }: PasswordStrengthIndicatorProps) => {
  const getStrengthWidth = () => {
    return `${(strength.score / 5) * 100}%`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Fortaleza de la contraseña:</span>
        <span className={`text-sm font-medium ${strength.color}`}>{strength.label}</span>
      </div>
      
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${strength.color.replace('text-', 'bg-')}`}
          style={{ width: getStrengthWidth() }}
        />
      </div>

      <div className="space-y-1 mt-3">
        <p className="text-xs text-muted-foreground font-medium">Requisitos:</p>
        <div className="grid grid-cols-1 gap-1">
          <RequirementItem
            met={strength.requirements.minLength}
            text="Mínimo 8 caracteres"
          />
          <RequirementItem
            met={strength.requirements.hasUpperCase}
            text="Al menos una letra mayúscula"
          />
          <RequirementItem
            met={strength.requirements.hasLowerCase}
            text="Al menos una letra minúscula"
          />
          <RequirementItem
            met={strength.requirements.hasNumber}
            text="Al menos un número"
          />
          <RequirementItem
            met={strength.requirements.hasSpecialChar}
            text="Al menos un carácter especial (!@#$%^&*)"
          />
        </div>
      </div>
    </div>
  );
};

interface RequirementItemProps {
  met: boolean;
  text: string;
}

const RequirementItem = ({ met, text }: RequirementItemProps) => (
  <div className="flex items-center gap-2">
    <div
      className={`w-4 h-4 rounded-full flex items-center justify-center ${
        met ? 'bg-success' : 'bg-muted'
      }`}
    >
      {met && (
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 3L4.5 8.5L2 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>
    <span className={`text-xs ${met ? 'text-foreground' : 'text-muted-foreground'}`}>
      {text}
    </span>
  </div>
);

export default PasswordStrengthIndicator;