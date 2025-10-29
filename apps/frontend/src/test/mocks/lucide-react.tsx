// Mock pour toutes les icônes Lucide utilisées dans l'app
interface MockIconProps {
  size?: number
  className?: string
  [key: string]: unknown
}

const mockIcon = ({ size = 24, className = '', ...props }: MockIconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
    data-testid="mock-icon"
  >
    <circle cx="12" cy="12" r="10" />
  </svg>
)

// Exporter toutes les icônes utilisées dans l'application
export const Network = mockIcon
export const Database = mockIcon
export const Shield = mockIcon
export const ArrowRight = mockIcon
export const Play = mockIcon
export const Cpu = mockIcon
export const FileText = mockIcon
export const MessageSquare = mockIcon
export const BarChart3 = mockIcon
export const Check = mockIcon
export const X = mockIcon
export const Phone = mockIcon
export const MapPin = mockIcon
export const Clock = mockIcon
export const Users = mockIcon
export const CheckCircle = mockIcon
export const Building = mockIcon
export const Car = mockIcon
export const Train = mockIcon
export const Mail = mockIcon
export const Calendar = mockIcon
export const Wrench = mockIcon
export const HeadphonesIcon = mockIcon
export const Gift = mockIcon
export const Brain = mockIcon
export const Zap = mockIcon
export const Lock = mockIcon
export const Globe = mockIcon
export const TrendingUp = mockIcon
export const Bot = mockIcon
export const Send = mockIcon
export const Loader2 = mockIcon
export const User = mockIcon
export const AlertCircle = mockIcon
export const Upload = mockIcon
export const Link = mockIcon
export const Settings = mockIcon
export const GraduationCap = mockIcon
export const Flag = mockIcon
export const Eye = mockIcon
export const Menu = mockIcon
export const Star = mockIcon
