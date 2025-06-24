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
import { Card } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { useEffect, useState, useCallback } from "react";
import { Search, Loader2, X, Trash2 } from "lucide-react";
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
  const [isSearching, setIsSearching] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async (searchParams: URLSearchParams) => {
    try {
      setIsSearching(true);
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
      setIsSearching(false);
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
      <Card className="p-4">
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-4 space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">User Records</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {totalRecords} records found
            </span>
            {(workAreaSearch || mobileNumber || startDateSearch) && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearAllFilters}
                className="flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by mobile number..."
              value={mobileNumber}
              onChange={handleMobileNumberChange}
              className="pl-9 pr-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-9 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {mobileNumber && (
              <button
                onClick={clearMobileNumberSearch}
                className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by work area..."
              value={workAreaSearch}
              onChange={handleWorkAreaChange}
              className="pl-9 pr-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-9 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {workAreaSearch && (
              <button
                onClick={clearWorkAreaSearch}
                className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by start date..."
              value={startDateSearch}
              onChange={handleStartDateChange}
              className="pl-9 pr-9"
            />
            {isSearching && (
              <Loader2 className="absolute right-9 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
            )}
            {startDateSearch && (
              <button
                onClick={clearStartDateSearch}
                className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Mobile Number</TableHead>
              <TableHead>Work Type</TableHead>
              <TableHead>Work Area</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.map((user) => (
              <TableRow key={user.id}>
                <TableCell>{`${user.first_name} ${user.last_name}`}</TableCell>
                <TableCell>{user.mobile_number}</TableCell>
                <TableCell>{user.work_type}</TableCell>
                <TableCell>{user.work_area}</TableCell>
                <TableCell>{user.primary_company}</TableCell>
                <TableCell>
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
                    className="flex items-center gap-2"
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
                  className="text-center py-6 text-muted-foreground"
                >
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </Card>
  );
}
