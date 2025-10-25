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
import { Search, Loader2, X, Calendar, Filter, RefreshCw } from "lucide-react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import debounce from "lodash/debounce";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface WeeklyEarning {
  id: string;
  mobile_number: string;
  earnings_screenshots: string[];
  incentives_screenshots: string[];
  weekly_expenses: number;
  total_earnings: number;
  total_incentives: number;
  work_hours: number;
  earnings: number;
  expenses: number;
  week_start_date: string;
  week_end_date: string;
  screen_shot?: string;
  status: "DRAFT" | "COMPLETED";
  created_at: string;
}

interface WeeklyEarningsResponse {
  data: WeeklyEarning[];
  total: number;
  page: number;
  totalPages: number;
}

export function EarningsDataTable() {
  const [data, setData] = useState<WeeklyEarningsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [mobileNumber, setMobileNumber] = useState("");
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async (searchParams: URLSearchParams) => {
    try {
      setError(null);
      const response = await fetch(`/api/weekly-earnings?${searchParams}`);
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
      setData(result);
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

    if (mobileNumber.trim()) {
      searchParams.append("mobile_number", mobileNumber.trim());
    }
    if (startDate) {
      searchParams.append("start_date", startDate.toISOString());
    }
    if (endDate) {
      searchParams.append("end_date", endDate.toISOString());
    }

    debouncedSearch(searchParams);
    return () => {
      debouncedSearch.cancel();
    };
  }, [page, mobileNumber, startDate, endDate, debouncedSearch]);


  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+]/g, "");
    setMobileNumber(value);
    setPage(1);
  };


  const clearMobileNumberSearch = () => {
    setMobileNumber("");
    setPage(1);
  };

  const clearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const searchParams = new URLSearchParams({
      page: page.toString(),
      limit: "10",
    });

    if (mobileNumber.trim()) {
      searchParams.append("mobile_number", mobileNumber.trim());
    }
    if (startDate) {
      searchParams.append("start_date", startDate.toISOString());
    }
    if (endDate) {
      searchParams.append("end_date", endDate.toISOString());
    }

    await fetchData(searchParams);
    setIsRefreshing(false);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">
            Loading earnings data...
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

        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
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

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-start text-left font-normal bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500",
                  !startDate && "text-slate-500"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "MMM dd") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={startDate}
                onSelect={setStartDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full h-11 justify-start text-left font-normal bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus:ring-2 focus:ring-blue-500",
                  !endDate && "text-slate-500"
                )}
              >
                <Calendar className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "MMM dd") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <CalendarComponent
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {(startDate || endDate) && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={clearDateRange}
              className="text-slate-600 dark:text-slate-400"
            >
              <X className="mr-2 h-4 w-4" />
              Clear Date Range
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
                  Mobile Number
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                  Total Earnings
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                  Total Incentives
                </TableHead>
                <TableHead className="text-right font-semibold text-slate-700 dark:text-slate-300">
                  Weekly Expenses
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Week Start
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Week End
                </TableHead>
                <TableHead className="font-semibold text-slate-700 dark:text-slate-300">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.data?.map((earning) => (
                <TableRow
                  key={earning.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
                >
                  <TableCell className="font-medium text-slate-900 dark:text-white">
                    {earning.mobile_number}
                  </TableCell>
                  <TableCell className="text-right font-medium text-green-600 dark:text-green-400">
                    ₹{earning.total_earnings?.toLocaleString() || earning.earnings?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-blue-600 dark:text-blue-400">
                    ₹{earning.total_incentives?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600 dark:text-red-400">
                    ₹{earning.weekly_expenses?.toLocaleString() || earning.expenses?.toLocaleString() || '0'}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {new Date(earning.week_start_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-slate-600 dark:text-slate-400">
                    {new Date(earning.week_end_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        earning.status === "COMPLETED"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                      }`}
                    >
                      {earning.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
              {(!data?.data || data.data.length === 0) && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                        <Search className="h-6 w-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium">No records found</p>
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
