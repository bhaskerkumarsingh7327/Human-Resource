import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { employeeApi } from '../../api/employeeApi';
import type { Employee } from '../../api/employeeApi';
import { avatarGradient } from '../../utils/avatarColor';

interface TreeNode extends Employee {
  children: TreeNode[];
}

function buildTree(employees: Employee[]): TreeNode[] {
  const map = new Map<number, TreeNode>();
  employees.forEach((e) => map.set(e.employee_id, { ...e, children: [] }));

  const roots: TreeNode[] = [];
  map.forEach((node) => {
    if (node.manager_id && map.has(node.manager_id)) {
      map.get(node.manager_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  });
  return roots;
}

function EmployeeCard({ node }: { node: TreeNode }) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      onClick={() => navigate(`/employees/${node.employee_id}`)}
      className="group cursor-pointer bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200 min-w-[180px] inline-block"
    >
      <div className="flex items-center gap-2.5">
        {node.profile_photo_url ? (
          <img
            src={`https://human-resource-lnps.onrender.com${node.profile_photo_url}`}
            alt=""
            className="w-9 h-9 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className={`w-9 h-9 rounded-full bg-gradient-to-br ${avatarGradient(
              node.first_name + node.last_name
            )} flex items-center justify-center text-white text-xs font-semibold shrink-0`}
          >
            {node.first_name[0]}
            {node.last_name[0]}
          </div>
        )}
        <div className="min-w-0 text-left">
          <p className="text-sm font-medium text-slate-800 truncate">
            {node.first_name} {node.last_name}
          </p>
          <p className="text-xs text-slate-500 truncate">
            {node.designation_title ?? node.department_name ?? '—'}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function TreeBranch({ node }: { node: TreeNode }) {
  return (
    <div className="flex flex-col items-center">
      <EmployeeCard node={node} />

      {node.children.length > 0 && (
        <>
          <div className="w-px h-6 bg-slate-300" />
          <div className="flex gap-10 pt-0">
            {node.children.map((child) => (
              <div key={child.employee_id} className="flex flex-col items-center">
                <TreeBranch node={child} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function OrgChartPage() {
  const { data: employees, isLoading } = useQuery({
    queryKey: ['employees-orgchart'],
    queryFn: employeeApi.listAll,
  });

  const tree = employees ? buildTree(employees) : [];

  return (
    <div className="p-8">
      <h1 className="font-display text-2xl font-semibold text-slate-900">Organization Chart</h1>
      <p className="text-slate-500 mt-1">Visual reporting structure across the company.</p>

      {isLoading ? (
        <p className="text-sm text-slate-400 mt-8">Loading...</p>
      ) : tree.length === 0 ? (
        <div className="text-center py-16 bg-white/40 backdrop-blur-xl rounded-2xl border border-slate-200/60 mt-8">
          <p className="text-slate-500">No employees found.</p>
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto pb-8">
          <div className="flex gap-16 justify-center min-w-max px-4">
            {tree.map((root) => (
              <TreeBranch key={root.employee_id} node={root} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}