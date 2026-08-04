"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Box, Stack, Typography, IconButton, Tooltip, Avatar, ButtonBase } from "@mui/material";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AutoAwesomeOutlinedIcon from "@mui/icons-material/AutoAwesomeOutlined";
import PublicOutlinedIcon from "@mui/icons-material/PublicOutlined";
import HelpOutlineOutlinedIcon from "@mui/icons-material/HelpOutlineOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import TravelExploreOutlinedIcon from "@mui/icons-material/TravelExploreOutlined";
import TodayOutlinedIcon from "@mui/icons-material/TodayOutlined";
import ViewKanbanOutlinedIcon from "@mui/icons-material/ViewKanbanOutlined";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";
import TimelineOutlinedIcon from "@mui/icons-material/TimelineOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import EditNoteOutlinedIcon from "@mui/icons-material/EditNoteOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { useThemeStore } from "@/store/useThemeStore";
import { useSyncStore } from "@/store/useSyncStore";
import { useLocaleStore } from "@/store/useLocaleStore";
import { useProfileStore } from "@/store/useProfileStore";
import { useT } from "@/hooks/useT";

const nav = [
  { href: "/", key: "dashboard", icon: DashboardOutlinedIcon },
  { href: "/vision", key: "vision", icon: AutoAwesomeOutlinedIcon },
  { href: "/problems", key: "problems", icon: PublicOutlinedIcon },
  { href: "/questions", key: "questions", icon: HelpOutlineOutlinedIcon },
  { href: "/reading", key: "reading", icon: MenuBookOutlinedIcon },
  { href: "/projects", key: "projects", icon: ViewKanbanOutlinedIcon },
  { href: "/graph", key: "graph", icon: HubOutlinedIcon },
  { href: "/research", key: "research", icon: TravelExploreOutlinedIcon },
  { href: "/briefing", key: "briefing", icon: TodayOutlinedIcon },
  { href: "/labs", key: "labs", icon: ScienceOutlinedIcon },
  { href: "/scholarships", key: "scholarships", icon: SchoolOutlinedIcon },
  { href: "/timeline", key: "timeline", icon: TimelineOutlinedIcon },
  { href: "/sop", key: "sop", icon: DescriptionOutlinedIcon },
  { href: "/journal", key: "journal", icon: EditNoteOutlinedIcon },
];

export function Sidebar() {
  const pathname = usePathname();
  const mode = useThemeStore((s) => s.mode);
  const toggleMode = useThemeStore((s) => s.toggleMode);
  const syncStatus = useSyncStore((s) => s.status);
  const locale = useLocaleStore((s) => s.locale);
  const toggleLocale = useLocaleStore((s) => s.toggleLocale);
  const profile = useProfileStore((s) => s.profile);
  const t = useT("nav");

  const displayName = profile.name.trim()
    ? [profile.prefix.trim(), profile.name.trim()].filter(Boolean).join(" ")
    : t("researcher");
  const avatarInitial = profile.name.trim()[0]?.toUpperCase() ?? "R";

  return (
    <Box
      component="nav"
      sx={{
        width: 264,
        flexShrink: 0,
        height: "100vh",
        position: "sticky",
        top: 0,
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Box sx={{ px: 3, pt: 3.5, pb: 2 }}>
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 600,
            letterSpacing: "0.06em",
            fontSize: "1.15rem",
          }}
        >
          PROMETHEUS
        </Typography>
        <Typography variant="caption" sx={{ color: "text.disabled", letterSpacing: "0.02em" }}>
          {t("brandTagline")}
        </Typography>
      </Box>

      <Stack sx={{ flex: 1, overflowY: "auto", px: 1.5, py: 1, gap: 0.25 }}>
        {nav.map(({ href, key, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                  px: 1.75,
                  py: 1,
                  borderRadius: 2,
                  color: active ? "text.primary" : "text.secondary",
                  bgcolor: active ? "action.selected" : "transparent",
                  transition: "background-color 150ms ease, color 150ms ease",
                  "&:hover": {
                    bgcolor: active ? "action.selected" : "action.hover",
                    color: "text.primary",
                  },
                }}
              >
                <Icon sx={{ fontSize: 19 }} />
                <Typography variant="body2" sx={{ fontWeight: active ? 600 : 400, fontSize: "0.86rem" }}>
                  {t(key)}
                </Typography>
              </Box>
            </Link>
          );
        })}
      </Stack>

      <Box sx={{ borderTop: "1px solid", borderColor: "divider", px: 2, py: 2 }}>
        <Link href="/settings" style={{ textDecoration: "none" }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.25,
              px: 0.75,
              py: 0.75,
              borderRadius: 2,
              mb: 1,
              color: pathname === "/settings" ? "text.primary" : "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
            }}
          >
            <Avatar
              src={profile.avatarUrl || undefined}
              sx={{ width: 28, height: 28, fontSize: "0.8rem", bgcolor: "primary.main", color: "primary.contrastText" }}
            >
              {!profile.avatarUrl && avatarInitial}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" noWrap sx={{ fontSize: "0.82rem", fontWeight: 500 }}>
                {displayName}
              </Typography>
              <Stack direction="row" alignItems="center" gap={0.5}>
                <FiberManualRecordIcon
                  sx={{
                    fontSize: 7,
                    color: syncStatus === "saving" ? "warning.main" : "success.main",
                  }}
                />
                <Typography variant="caption" sx={{ fontSize: "0.68rem" }}>
                  {syncStatus === "saving" ? t("saving") : t("synced")}
                </Typography>
              </Stack>
            </Box>
            <Tooltip title={mode === "dark" ? "Switch to light" : "Switch to dark"}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.preventDefault();
                  toggleMode();
                }}
              >
                {mode === "dark" ? <LightModeOutlinedIcon sx={{ fontSize: 17 }} /> : <DarkModeOutlinedIcon sx={{ fontSize: 17 }} />}
              </IconButton>
            </Tooltip>
          </Box>
        </Link>
        <Tooltip title={t("language")}>
          <ButtonBase
            onClick={toggleLocale}
            sx={{
              width: "100%",
              px: 0.75,
              py: 0.75,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover", color: "text.primary" },
            }}
          >
            <Typography variant="caption" sx={{ fontSize: "0.72rem" }}>
              {t("language")}
            </Typography>
            <Stack direction="row" spacing={0.5}>
              <Box
                sx={{
                  px: 0.9,
                  py: 0.15,
                  borderRadius: 1,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: locale === "en" ? "primary.main" : "transparent",
                  color: locale === "en" ? "primary.contrastText" : "text.disabled",
                }}
              >
                EN
              </Box>
              <Box
                sx={{
                  px: 0.9,
                  py: 0.15,
                  borderRadius: 1,
                  fontSize: "0.65rem",
                  fontWeight: 700,
                  bgcolor: locale === "th" ? "primary.main" : "transparent",
                  color: locale === "th" ? "primary.contrastText" : "text.disabled",
                }}
              >
                ไทย
              </Box>
            </Stack>
          </ButtonBase>
        </Tooltip>
      </Box>
    </Box>
  );
}
