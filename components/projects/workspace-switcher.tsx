"use client";

import { useState, useEffect } from "react";
import {
  CaretUpDown,
  User,
  Buildings,
  Plus,
  Gear,
  Check,
} from "@phosphor-icons/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useProjectStore } from "./project-store";
import { useAuth } from "@/components/providers/auth-provider";
import { CreateCompanyDialog } from "./create-company-dialog";
import type { PSKWorkspaceContext } from "@/lib/types";

interface WorkspaceSwitcherProps {
  onSettingsClick?: (companyId: string) => void;
}

export function WorkspaceSwitcher({ onSettingsClick }: WorkspaceSwitcherProps) {
  const { user } = useAuth();
  const {
    currentWorkspace,
    companies,
    setWorkspace,
    initializeCompanies,
  } = useProjectStore();

  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Load companies on mount (only once when user is available)
  useEffect(() => {
    if (user) {
      initializeCompanies();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSelectPersonal = () => {
    const workspace: PSKWorkspaceContext = {
      type: "personal",
      companyId: null,
      companyName: null,
    };
    setWorkspace(workspace);
  };

  const handleSelectCompany = (companyId: string, companyName: string) => {
    const workspace: PSKWorkspaceContext = {
      type: "company",
      companyId,
      companyName,
    };
    setWorkspace(workspace);
  };

  const currentLabel = currentWorkspace.type === "personal"
    ? "Personal"
    : currentWorkspace.companyName || "Company";

  const CurrentIcon = currentWorkspace.type === "personal" ? User : Buildings;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between gap-2 font-normal"
          >
            <span className="flex items-center gap-2 truncate">
              <CurrentIcon className="size-4 shrink-0" />
              <span className="truncate">{currentLabel}</span>
            </span>
            <CaretUpDown className="size-4 shrink-0 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-[200px]">
          <DropdownMenuLabel>Workspace</DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Personal workspace */}
          <DropdownMenuItem
            onClick={handleSelectPersonal}
            className="gap-2"
          >
            <User className="size-4" />
            <span className="flex-1">Personal</span>
            {currentWorkspace.type === "personal" && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>

          {/* Company workspaces */}
          {companies.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs">Companies</DropdownMenuLabel>
              {companies.map((company) => (
                <DropdownMenuItem
                  key={company.id}
                  onClick={() => handleSelectCompany(company.id, company.name)}
                  className="gap-2 group"
                >
                  <Buildings className="size-4" />
                  <span className="flex-1 truncate">{company.name}</span>
                  {currentWorkspace.companyId === company.id && (
                    <Check className="size-4 text-primary" />
                  )}
                  {onSettingsClick && company.owner_id === user?.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSettingsClick(company.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-0.5 hover:bg-muted rounded transition-opacity"
                    >
                      <Gear className="size-3.5 text-muted-foreground" />
                    </button>
                  )}
                </DropdownMenuItem>
              ))}
            </>
          )}

          {/* Create company option */}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCreateDialog(true)}
            className="gap-2"
          >
            <Plus className="size-4" />
            <span>Create Company</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CreateCompanyDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </>
  );
}
