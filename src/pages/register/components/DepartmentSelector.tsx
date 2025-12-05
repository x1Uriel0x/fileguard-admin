import type { Department } from '../types';
import Select from '../../../components/ui/Select';

interface DepartmentSelectorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  departments: Department[];
}

const DepartmentSelector = ({
  value,
  onChange,
  error,
  departments,
}: DepartmentSelectorProps) => {
  return (
    <Select
      label="Departamento"
      description="Seleccione su departamento de trabajo"
      placeholder="Seleccionar departamento"
      value={value}
      onChange={onChange}
      options={departments}
      error={error}
      required
      searchable
    />
  );
};

export default DepartmentSelector;