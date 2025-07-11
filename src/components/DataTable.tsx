"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { useEffect, useState, useCallback } from "react";
import {
  Search,
  Loader2,
  X,
  Trash2,
  Filter,
  Users,
  RefreshCw,
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  work_type: string;
  work_area: string;
  primary_company: string;
  created_at: string;
  start_date: string;
}

export function DataTable() {
  const [data, setData] = useState<User[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [workAreaSearch, setWorkAreaSearch] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [startDateSearch, setStartDateSearch] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (searchParams: URLSearchParams) => {
    try {
      setError(null);
      const response = await fetch(`/api/flows?${searchParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to fetch data (${response.status})`
        );
      }
      const result = await response.json();
      if (result.error) {
        throw new Error(result.error);
      }
      setData(result.data);
      setTotalPages(result.totalPages);
      setTotalRecords(result.total);
    } catch (error) {
      console.error("Error fetching data:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch data");
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedSearch = useCallback(
    debounce((searchParams: URLSearchParams) => {
      fetchData(searchParams);
    }, 500),
    []
  );

  // Initial data load
  useEffect(() => {
    const initialParams = new URLSearchParams({
      page: "1",
      limit: "10",
    });
    fetchData(initialParams);
  }, []);

  // Handle search changes
  useEffect(() => {
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: "10",
    });

    if (workAreaSearch.trim()) {
      searchParams.append("work_area", workAreaSearch.trim());
    }
    if (mobileNumber.trim()) {
      searchParams.append("mobile_number", mobileNumber.trim());
    }
    if (startDateSearch.trim()) {
      searchParams.append("start_date", startDateSearch.trim());
    }

    debouncedSearch(searchParams);
    return () => {
      debouncedSearch.cancel();
    };
  }, [page, workAreaSearch, mobileNumber, startDateSearch, debouncedSearch]);

  const handleWorkAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkAreaSearch(e.target.value);
    setPage(1);
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers and + sign
    const value = e.target.value.replace(/[^\d+]/g, "");
    setMobileNumber(value);
    setPage(1);
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDateSearch(e.target.value);
    setPage(1);
  };

  const clearWorkAreaSearch = () => {
    setWorkAreaSearch("");
    setPage(1);
  };

  const clearMobileNumberSearch = () => {
    setMobileNumber("");
    setPage(1);
  };

  const clearStartDateSearch = () => {
    setStartDateSearch("");
    setPage(1);
  };

  const clearAllFilters = () => {
    setWorkAreaSearch("");
    setMobileNumber("");
    setStartDateSearch("");
    setPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: "10",
    });

    if (workAreaSearch.trim()) {
      searchParams.append("work_area", workAreaSearch.trim());
    }
    if (mobileNumber.trim()) {
      searchParams.append("mobile_number", mobileNumber.trim());
    }
    if (startDateSearch.trim()) {
      searchParams.append("start_date", startDateSearch.trim());
    }

    await fetchData(searchParams);
    setIsRefreshing(false);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Are you sure you want to delete this user record?")) {
      return;
    }

    try {
      setDeletingId(userId);
      const response = await fetch(`/api/flows/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `Failed to delete user (${response.status})`
        );
      }

      // Refresh the data after successful deletion
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (workAreaSearch.trim()) {
        searchParams.append("work_area", workAreaSearch.trim());
      }
      if (mobileNumber.trim()) {
        searchParams.append("mobile_number", mobileNumber.trim());
      }
      if (startDateSearch.trim()) {
        searchParams.append("start_date", startDateSearch.trim());
      }

      await fetchData(searchParams);
    } catch (error) {
      console.error("Error deleting user:", error);
      setError(
        error instanceof Error ? error.message : "Failed to delete user"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading user data...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Filters & Search
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {totalRecords} records found
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by mobile number..."
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              className="pl-10 pr-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
            {mobileNumber && (
              <button
                onClick={clearMobileNumberSearch}
                className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by work area..."
              value={workAreaSearch}
              onChange={handleWorkAreaChange}
              className="pl-10 pr-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
            {workAreaSearch && (
              <button
                onClick={clearWorkAreaSearch}
                className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search by start date..."
              value={startDateSearch}
              onChange={handleStartDateChange}
              className="pl-10 pr-10 h-11 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500"
            />
            {startDateSearch && (
              <button
                onClick={clearStartDateSearch}
                className="absolute right-3 top-3 h-4 w-4 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {(workAreaSearch || mobileNumber || startDateSearch) && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-slate-600 dark:text-slate-400"
            >
              <X className="mr-2 h-4 w-4" />
              Clear All Filters
            </Button>
          </div>
        )}
      </div>

      {/* Table Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-800 shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-900">
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Name
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Mobile Number
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Work Type
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Work Area
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Company
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Start Date
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.map((user) => (
                <TableRow
                  key={user.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {`${user.first_name} ${user.last_name}`}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {user.mobile_number}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {user.work_type}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {user.work_area}
                  </TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">
                    {user.primary_company}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {user.start_date
                      ? new Date(user.start_date).toLocaleDateString()
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(user.id)}
                      disabled={deletingId === user.id}
                      className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      {deletingId === user.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      {deletingId === user.id ? "Deleting..." : "Delete"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {(!data || data.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">No users found</p>
                      <p className="text-xs">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page {page} of {totalPages}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
}
