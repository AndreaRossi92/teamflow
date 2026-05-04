import { useTranslation } from "react-i18next";
import useUserDetailQuery from "../../hooks/users/useUserDetailQuery";
import { useParams } from "react-router-dom";
import PageHeader from "../../components/PageHeader";
import UserDetail from "../../components/users/UserDetail";
import PageLoader from "../../components/PageLoader";
import { IconButton, Stack } from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

export default function UserDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const user = useUserDetailQuery(id ?? "");

  return (
    <>
      <PageHeader
        title={t("user")}
        subtitle={t("detail")}
        actions={
          <Stack direction="row" spacing={1}>
            <IconButton size="small" title={t("edit")}>
              <Edit fontSize="small" />
            </IconButton>
            <IconButton size="small" title={t("delete")}>
              <Delete fontSize="small" />
            </IconButton>
          </Stack>
        }
      />
      {user.isFetching && <PageLoader />}
      {!user.isFetching && !!user.data && <UserDetail user={user.data} />}
    </>
  );
}
