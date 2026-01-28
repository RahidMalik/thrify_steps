import { useState, useEffect } from "react";
import { Users, Mail, ShieldCheck, Trash2, User as UserIcon } from "lucide-react";
import api, { User } from "@/lib/api";
import { toast } from "sonner";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const AdminUsers = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllUsers();
            if (response.success && response.data?.users) {
                setUsers(response.data.users);
            }
        } catch (error) {
            const err = error as Error;
            toast.error(err.message || "Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure? This action cannot be undone.")) return;
        toast.info("Delete logic needs backend integration");
    };

    return (
        <div className="space-y-6 pb-10">
            {/* Header Section - Responsive Flex */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Users className="w-6 h-6 md:w-8 md:h-8 text-primary" /> Users
                    </h1>
                    <p className="text-sm text-muted-foreground">Manage your community members</p>
                </div>
                <Badge variant="secondary" className="text-sm md:text-base px-4 py-1">
                    {users.length} Total Users
                </Badge>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
                    {[1, 2, 3].map(i => <div key={i} className="h-32 bg-slate-100 rounded-lg" />)}
                </div>
            ) : (
                <>
                    {/* Desktop View: Proper Table (Hidden on Mobile) */}
                    <div className="hidden md:block bg-white border rounded-xl overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead>User Details</TableHead>
                                    <TableHead>Email Address</TableHead>
                                    <TableHead>Account Role</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} className="hover:bg-slate-50/50">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <span className="capitalize">{user.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2 text-muted-foreground italic">
                                                <Mail className="w-3.5 h-3.5" /> {user.email}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={user.role === 'admin' ? "default" : "outline"} className="gap-1">
                                                {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                                                {user.role}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="text-red-500 hover:bg-red-500"
                                                disabled={user.role === 'admin'}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Mobile View: Cards */}
                    <div className="grid grid-cols-1 gap-4 md:hidden">
                        {users.map((user) => (
                            <div key={user._id} className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        {/* User Icon/Initial */}
                                        <div className="w-10 h-10 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                                            <UserIcon className="w-5 h-5 text-slate-500" />
                                        </div>

                                        {/* Text Container - min-w-0 is key here */}
                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold capitalize truncate">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate break-all">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Badge - shrink-0 ensures it stays its size */}
                                    <Badge
                                        variant={user.role === 'admin' ? "default" : "outline"}
                                        className="shrink-0 whitespace-nowrap"
                                    >
                                        {user.role}
                                    </Badge>
                                </div>

                                <div className="pt-2 border-t">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-red-500 border-red-100 w-full hover:bg-red-50"
                                        disabled={user.role === 'admin'}
                                        onClick={() => handleDeleteUser(user._id)}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" /> Delete Account
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {!loading && users.length === 0 && (
                <div className="text-center py-20 bg-slate-50 rounded-xl border-2 border-dashed">
                    <Users className="w-12 h-12 mx-auto text-slate-300 mb-3" />
                    <p className="text-muted-foreground font-medium">No users found in your database.</p>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;