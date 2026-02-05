import { useState, useEffect } from "react";
import { Users, Mail, ShieldCheck, Trash2, Loader2 } from "lucide-react";
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
        if (!confirm("Are you sure? This user and their associated data will be permanently removed.")) return;

        try {
            const response = await api.deleteUser(id);
            if (response.success) {
                setUsers((prevUsers) => prevUsers.filter((u) => u._id !== id));
                toast.success("User deleted successfully");
            }
        } catch (error: any) {
            console.error("Delete Error:", error);
            toast.error(error.response?.data?.message || "Failed to delete user.");
        }
    };

    return (
        <div className="space-y-6 pb-10 bg-background text-foreground min-h-screen transition-colors duration-300">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 rounded-xl border border-border bg-card">
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
                <div className="flex justify-center py-20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            ) : (
                <>
                    {/* Desktop View: Proper Table */}
                    <div className="hidden md:block bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow className="border-border">
                                    <TableHead className="text-foreground">User Details</TableHead>
                                    <TableHead className="text-foreground">Email Address</TableHead>
                                    <TableHead className="text-foreground">Account Role</TableHead>
                                    <TableHead className="text-right text-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow key={user._id} className="border-border hover:bg-muted/30">
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shrink-0 shadow-sm">
                                                    {user.avatar ? (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                                                            {user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <span className="capitalize font-semibold text-foreground">{user.name}</span>
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
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
                            <div key={user._id} className="bg-card p-4 rounded-xl border border-border shadow-sm space-y-4">
                                <div className="flex justify-between items-start gap-2">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <div className="w-12 h-12 shrink-0 rounded-full overflow-hidden border border-border bg-muted flex items-center justify-center shadow-sm">
                                            {user.avatar ? (
                                                <img
                                                    src={user.avatar}
                                                    alt={user.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full text-foreground/70 flex items-center justify-center font-bold text-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <p className="font-bold capitalize truncate text-foreground">{user.name}</p>
                                            <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                                <Mail className="w-3 h-3" /> {user.email}
                                            </p>
                                        </div>
                                    </div>

                                    <Badge
                                        variant={user.role === 'admin' ? "default" : "outline"}
                                        className="shrink-0"
                                    >
                                        {user.role}
                                    </Badge>
                                </div>

                                <div className="pt-2 border-t border-border">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-destructive border-destructive/20 w-full hover:bg-destructive/10"
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
                <div className="text-center py-20 rounded-xl border-2 border-dashed border-border">
                    <Users className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                    <p className="text-muted-foreground font-medium">No users found in your database.</p>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;