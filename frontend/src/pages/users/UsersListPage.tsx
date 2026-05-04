import { useEffect, useRef } from "react";
import { IconButton, LinearProgress } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import UsersList from "../../components/users/UsersList";
import useUsersListQuery from "../../hooks/users/useUsersListQuery";
import PageHeader from "../../components/PageHeader";

export default function UserListPage() {
  const { t } = useTranslation("user");
  const { data, isFetching, isFetchingNextPage, hasNextPage, fetchNextPage } =
    useUsersListQuery();

  const users = data?.pages.flat() ?? [];

  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <>
      <PageHeader
        title={t("users")}
        subtitle={t("list")}
        actions={
          <IconButton>
            <Add />
          </IconButton>
        }
      />

      {isFetching && !isFetchingNextPage && <LinearProgress />}

      <UsersList users={users} />

      <div ref={sentinelRef} style={{ height: 1 }} />

      {isFetchingNextPage && <LinearProgress />}
    </>
  );
}
