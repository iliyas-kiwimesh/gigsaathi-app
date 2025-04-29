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
import { Search, Loader2, X, Calendar } from "lucide-react";
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

interface WeeklyEarning {
  id: string;
  user_id: string;
  mobile_number: string;
  work_area: string;
  work_hours: number;
  earnings: number;
  expenses: number;
  week_start_date: string;
  week_end_date: string;
  primary_company: string;
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
  const [workAreaSearch, setWorkAreaSearch] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();

  const fetchData = async (searchParams: URLSearchParams) => {
    try {
      setIsSearching(true);
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
  }, [page, workAreaSearch, mobileNumber, startDate, endDate, debouncedSearch]);

  const handleWorkAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkAreaSearch(e.target.value);
    setPage(1);
  };

  const handleMobileNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d+]/g, "");
    setMobileNumber(value);
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

  const clearDateRange = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setPage(1);
  };

  if (loading && !data) {
    return (
      <Card className="p-6">
        <div className="h-[400px] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {totalRecords} records found
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-4">
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
          <div className="flex gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {startDate ? (
                    format(startDate, "PPP")
                  ) : (
                    <span>Start Date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
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
                    "w-full justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : <span>End Date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {(startDate || endDate) && (
              <Button
                variant="outline"
                size="icon"
                onClick={clearDateRange}
                className="flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Mobile Number</TableHead>
              <TableHead className="w-[150px]">Work Area</TableHead>
              <TableHead className="w-[150px]">Company</TableHead>
              <TableHead className="text-right w-[100px]">Work Hours</TableHead>
              <TableHead className="text-right w-[120px]">Earnings</TableHead>
              <TableHead className="text-right w-[120px]">Expenses</TableHead>
              <TableHead className="text-right w-[120px]">
                Net Earnings
              </TableHead>
              <TableHead className="w-[120px]">Week Start</TableHead>
              <TableHead className="w-[120px]">Week End</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data?.data?.map((earning) => (
              <TableRow key={earning.id}>
                <TableCell className="font-medium">
                  {earning.mobile_number}
                </TableCell>
                <TableCell>{earning.work_area}</TableCell>
                <TableCell>{earning.primary_company}</TableCell>
                <TableCell className="text-right">
                  {earning.work_hours.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ₹{earning.earnings.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  ₹{earning.expenses.toLocaleString()}
                </TableCell>
                <TableCell className="text-right font-medium">
                  ₹{(earning.earnings - earning.expenses).toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(earning.week_start_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(earning.week_end_date).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
            {(!data?.data || data.data.length === 0) && (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
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
