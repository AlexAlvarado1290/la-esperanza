import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import { UserPlus, Edit2, ShieldBan, ShieldCheck, KeyRound, CheckCircle2 } from "lucide-react";
import { Button, Card, CardContent, Badge } from "../components/ui";
import { api, ApiError } from "../../lib/api";
import { useRole } from "../../lib/auth";
import type { UsuarioAdmin, BackendRol } from "../../lib/types";

const statusColors: Record<string, "success" | "warning" | "danger"> = {
  ACTIVO: "success",
  SUSPENDIDO: "warning",
  BLOQUEADO: "danger",
};

export function UsersList() {
  const role = useRole();
  const [searchParams, setSearchParams] = useSearchParams();
  const [users, setUsers] = useState<UsuarioAdmin[]>([]);
  const [pinReset, setPinReset] = useState<{ id: number; pinInicial: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const filterType = searchParams.get("tab") || "todos";

  const reload = async () => {
    setLoading(true);
    try {
      const filtroRol: BackendRol | undefined =
        filterType === "productor" ? "PRODUCTOR" : filterType === "comprador" ? "COMPRADOR" : undefined;
      const data = await api.get<UsuarioAdmin[]>("/users", { query: { rol: filtroRol } });
      setUsers(data);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "No se pudo cargar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") reload();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role, filterType]);

  if (role !== "admin") {
    return <div className="text-center py-20 text-gray-500 text-lg">Esta sección es exclusiva de la Asociación.</div>;
  }

  const cycleStatus = async (user: UsuarioAdmin) => {
    const nextMap: Record<string, "ACTIVO" | "SUSPENDIDO" | "BLOQUEADO"> = {
      ACTIVO: "SUSPENDIDO",
      SUSPENDIDO: "BLOQUEADO",
      BLOQUEADO: "ACTIVO",
    };
    const next = nextMap[user.estadoCuenta];
    const motivo =
      next === "ACTIVO" ? "Reactivación por la Asociación" : window.prompt(`Motivo para ${next}:`) || "";
    if (next !== "ACTIVO" && !motivo) return;
    try {
      await api.patch(`/users/${user.idUsuario}/estado`, { estado: next, motivo });
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al cambiar estado.");
    }
  };

  const handleResetPin = async (userId: number) => {
    try {
      const res = await api.post<{ pinInicial: string }>(`/users/${userId}/reset-pin`);
      setPinReset({ id: userId, pinInicial: res.pinInicial });
      setTimeout(() => setPinReset(null), 4000);
      reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Error al reiniciar PIN.");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Gestión de Usuarios</h1>
          <p className="text-gray-500 mt-1 text-lg">Solo la Asociación puede crear y administrar cuentas</p>
        </div>
        <Link to="/users/new">
          <Button className="w-full sm:w-auto text-lg gap-2" size="lg">
            <UserPlus className="w-6 h-6" /> Alta de Usuario
          </Button>
        </Link>
      </header>

      <div className="bg-white p-2 rounded-2xl flex flex-wrap gap-2 border border-gray-200 shadow-sm">
        {[
          { key: "todos", label: "Todos" },
          { key: "productor", label: "Productores" },
          { key: "comprador", label: "Compradores" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSearchParams({ tab: tab.key })}
            className={`flex-1 min-w-[100px] text-lg font-bold py-3 px-4 rounded-xl transition-colors ${
              filterType === tab.key ? "bg-green-700 text-white" : "bg-transparent text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm font-semibold">{error}</div>}

      <div className="grid gap-4 mt-6">
        {loading ? (
          <p className="text-center text-gray-500 py-8">Cargando…</p>
        ) : users.length === 0 ? (
          <p className="text-center text-gray-500 text-lg py-12">No hay usuarios en esta categoría.</p>
        ) : (
          users.map((user) => (
            <Card key={user.idUsuario} className="hover:border-green-400 transition-colors">
              <CardContent className="p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-2xl font-bold text-gray-900">{user.nombreCompleto}</h2>
                      <Badge variant={statusColors[user.estadoCuenta]} className="text-xs uppercase px-2 py-0.5">
                        {user.estadoCuenta}
                      </Badge>
                    </div>
                    <div className="text-gray-600 text-lg space-y-1">
                      <p><span className="font-semibold">Tel:</span> {user.telefono}</p>
                      <p><span className="font-semibold">DPI:</span> {user.cui}</p>
                      <p className="text-green-700 font-bold uppercase">{user.rol.nombre}</p>
                    </div>
                  </div>
                </div>

                {pinReset?.id === user.idUsuario && (
                  <div className="bg-green-50 text-green-700 p-3 rounded-xl flex items-center gap-2 text-sm font-semibold">
                    <CheckCircle2 className="w-5 h-5" /> PIN reiniciado a <span className="font-mono">{pinReset.pinInicial}</span>. El usuario debe cambiarlo al ingresar.
                  </div>
                )}

                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                  <Link to={`/users/new?edit=true&userId=${user.idUsuario}`}>
                    <Button variant="outline" size="sm" className="gap-2 text-base">
                      <Edit2 className="w-4 h-4" /> Editar
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2 text-base border-orange-200 text-orange-700 hover:bg-orange-50"
                    onClick={() => handleResetPin(user.idUsuario)}
                  >
                    <KeyRound className="w-4 h-4" /> Reiniciar PIN
                  </Button>
                  <Button
                    variant={user.estadoCuenta === "ACTIVO" ? "danger" : "default"}
                    size="sm"
                    className="gap-2 text-base"
                    onClick={() => cycleStatus(user)}
                  >
                    {user.estadoCuenta === "ACTIVO" ? (
                      <><ShieldBan className="w-4 h-4" /> Suspender</>
                    ) : user.estadoCuenta === "SUSPENDIDO" ? (
                      <><ShieldBan className="w-4 h-4" /> Bloquear</>
                    ) : (
                      <><ShieldCheck className="w-4 h-4" /> Reactivar</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
