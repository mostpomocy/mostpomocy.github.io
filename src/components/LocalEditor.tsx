"use client";
import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import {
  Admin,
  Resource,
  List,
  Datagrid,
  TextField,
  DateField,
  BooleanField,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  SelectInput,
  BooleanInput,
  ReferenceInput,
  ReferenceArrayInput,
  SelectArrayInput,
  ReferenceField,
  EditButton,
  CreateButton,
  TopToolbar,
  SearchInput,
  TabbedForm,
  FormTab,
  DateTimeInput,
  required,
  useRecordContext,
  useResourceContext,
  useRefresh,
  useNotify,
  useDataProvider,
  useGetList,
  Title,
  Layout,
  Menu,
  CustomRoutes,
  defaultTheme,
  FunctionField,
  ExportButton,
} from "react-admin";
import type { DataProvider, AuthProvider } from "react-admin";
import { RichTextInput } from "ra-input-rich-text";
import { Route } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Stack,
  Chip,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import CategoryIcon from "@mui/icons-material/Category";
import PlaceIcon from "@mui/icons-material/Place";
import ImageIcon from "@mui/icons-material/Image";
import SettingsIcon from "@mui/icons-material/Settings";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import polyglotI18nProvider from "ra-i18n-polyglot";
import englishMessages from "ra-language-english";

async function api(url: string, options: RequestInit = {}): Promise<any> {
  const response = await fetch(url, {
    credentials: "same-origin",
    ...options,
    headers: { "Content-Type": "application/json", ...options.headers },
  });
  const body = (await response.json()) as any;
  if (!response.ok)
    throw Object.assign(
      new Error(body.message || "Nie udało się zapisać zmian"),
      { status: response.status },
    );
  return body;
}
const dataProvider: DataProvider = {
  getList: async (resource, params) =>
    api(
      "/api/admin/" +
        resource +
        "?" +
        new URLSearchParams({
          sort: JSON.stringify([
            params.sort?.field || "updated_at",
            params.sort?.order || "DESC",
          ]),
          range: JSON.stringify([
            ((params.pagination?.page || 1) - 1) *
              (params.pagination?.perPage || 25),
            (params.pagination?.page || 1) *
              (params.pagination?.perPage || 25) -
              1,
          ]),
          filter: JSON.stringify(params.filter || {}),
        }),
    ),
  getOne: async (r, p) => api("/api/admin/" + r + "/" + p.id),
  getMany: async (r, p) =>
    api(
      "/api/admin/" +
        r +
        "?" +
        new URLSearchParams({
          filter: JSON.stringify({ ids: p.ids }),
          range: "[0,9999]",
        }),
    ),
  getManyReference: async (r, p) =>
    dataProvider.getList(r, {
      ...p,
      filter: { ...p.filter, [p.target]: p.id },
    }),
  create: async (r, p) =>
    api("/api/admin/" + r, { method: "POST", body: JSON.stringify(p.data) }),
  update: async (r, p) =>
    api("/api/admin/" + r + "/" + p.id, {
      method: "PUT",
      body: JSON.stringify(p.data),
    }),
  updateMany: async (r, p) => {
    await Promise.all(
      p.ids.map(async (id) => {
        const { data } = await dataProvider.getOne(r, { id });
        return dataProvider.update(r, {
          id,
          data: { ...data, ...p.data },
          previousData: data,
        });
      }),
    );
    return { data: p.ids };
  },
  delete: async (r, p) =>
    api("/api/admin/" + r + "/" + p.id, { method: "DELETE" }),
  deleteMany: async (r, p) => {
    await Promise.all(p.ids.map((id) => dataProvider.delete(r, { id })));
    return { data: p.ids };
  },
};
const authProvider: AuthProvider = {
  login: async () => {},
  logout: async () => {
    location.href = "/";
  },
  checkAuth: async () => {
    await api("/api/admin/identity");
  },
  checkError: async (error) => {
    if (error.status === 403) throw error;
  },
  getIdentity: async () => api("/api/admin/identity"),
  getPermissions: async () => ["admin"],
};
const messages = {
  ...englishMessages,
  ra: {
    ...englishMessages.ra,
    action: {
      ...englishMessages.ra.action,
      add: "Dodaj",
      back: "Wróć",
      cancel: "Anuluj",
      clear_input_value: "Wyczyść",
      clone: "Duplikuj",
      confirm: "Potwierdź",
      create: "Dodaj",
      delete: "Usuń",
      edit: "Edytuj",
      export: "Eksportuj CSV",
      list: "Lista",
      refresh: "Odśwież",
      remove: "Usuń",
      save: "Zapisz",
      search: "Szukaj",
      show: "Pokaż",
      sort: "Sortuj",
      undo: "Cofnij",
      unselect: "Odznacz",
      update: "Zaktualizuj",
    },
    navigation: {
      ...englishMessages.ra.navigation,
      page_rows_per_page: "Wierszy na stronie:",
      page_range_info: "%{offsetBegin}–%{offsetEnd} z %{total}",
      next: "Dalej",
      prev: "Wstecz",
      no_results: "Brak wyników",
      no_filtered_results: "Brak wyników dla tych filtrów",
      skip_nav: "Przejdź do treści",
    },
    page: {
      ...englishMessages.ra.page,
      dashboard: "Przegląd redakcji",
      create: "Dodaj %{name}",
      edit: "Edycja: %{name}",
      list: "%{name}",
      empty: "Brak elementów: %{name}",
      invite: "Dodaj pierwszy element, aby zacząć.",
    },
    notification: {
      ...englishMessages.ra.notification,
      updated: "Zmiany zapisane",
      created: "Dodano",
      deleted: "Usunięto",
      data_provider_error: "Nie udało się wykonać operacji",
    },
    auth: {
      ...englishMessages.ra.auth,
      logout: "Wyloguj",
      user_menu: "Konto autora",
    },
  },
};
const i18n = polyglotI18nProvider(() => messages, "pl");
const statuses = [
  { id: "draft", name: "Szkic" },
  { id: "published", name: "Opublikowany" },
  { id: "scheduled", name: "Zaplanowany" },
  { id: "trashed", name: "Kosz" },
];
const statusLabel = (v: string) => statuses.find((s) => s.id === v)?.name || v;
const toISO = (value: any) => (value ? new Date(value).toISOString() : null);
function AdminMenu() {
  return (
    <Menu>
      <Menu.DashboardItem />
      <Menu.ResourceItems />
      <Menu.Item
        to="/statystyki"
        primaryText="Statystyki Google"
        leftIcon={<QueryStatsIcon />}
      />
      <Menu.Item
        to="/integracja"
        primaryText="Google i publikacja"
        leftIcon={<SettingsIcon />}
      />
      <Menu.Item
        to="/"
        primaryText="Otwórz blog ↗"
        onClick={() => {
          window.open("/", "_blank");
        }}
      />
    </Menu>
  );
}
function AdminLayout(props: any) {
  return <Layout {...props} menu={AdminMenu} />;
}
function PostList() {
  return (
    <List
      title="Artykuły"
      sort={{ field: "updated_at", order: "DESC" }}
      filters={[
        <SearchInput source="q" alwaysOn key="q" />,
        <SelectInput
          key="status"
          source="status"
          label="Status"
          choices={statuses}
          alwaysOn
        />,
        <ReferenceInput
          key="category"
          source="category_id"
          reference="categories"
          alwaysOn
        >
          <SelectInput optionText="name" label="Kategoria" />
        </ReferenceInput>,
        <SelectInput
          key="scope"
          source="scope"
          label="Publikacja"
          choices={[
            { id: "general", name: "Ogólna" },
            { id: "sosnowiec", name: "O Sosnowcu" },
          ]}
          alwaysOn
        />,
      ]}
      actions={
        <TopToolbar>
          <CreateButton label="Nowy artykuł" />
          <ExportButton />
        </TopToolbar>
      }
    >
      <Datagrid
        sx={{ "& .column-title": { minWidth: 230, maxWidth: 400 } }}
        rowClick="edit"
      >
        <TextField source="title" label="Tytuł" />
        <ReferenceField
          source="category_id"
          reference="categories"
          label="Kategoria"
        >
          <TextField source="name" />
        </ReferenceField>
        <FunctionField
          label="Status"
          render={(r: any) => (
            <Chip
              size="small"
              label={statusLabel(r.status)}
              color={r.status === "published" ? "success" : "default"}
            />
          )}
        />
        <DateField
          source="published_at"
          label="Publikacja"
          showTime
          locales="pl-PL"
        />
        <EditButton />
      </Datagrid>
    </List>
  );
}
function Preview() {
  const record = useRecordContext();
  const resource = useResourceContext();
  return record ? (
    <Button
      component="a"
      href={
        (resource === "pages"
          ? record.section === "sosnowiec"
            ? "/sosnowiec/"
            : "/"
          : "/artykuly/") +
        record.slug +
        "/"
      }
      target="_blank"
    >
      Podgląd treści ↗
    </Button>
  ) : null;
}
function Revisions() {
  const record = useRecordContext();
  const resource = useResourceContext();
  const [items, setItems] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const refresh = useRefresh();
  const notify = useNotify();
  const provider = useDataProvider();
  useEffect(() => {
    if (record?.id)
      api("/api/admin/revisions/" + record.id)
        .then((r) => setItems(r.data))
        .catch(() => setItems([]));
  }, [record?.id, record?.updated_at]);
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h6">Historia zmian</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Każdy zapis zachowuje poprzednią wersję. Wyświetlamy 30 ostatnich
        wersji.
      </Typography>
      {items.length === 0 && (
        <Alert severity="info">
          Historia pojawi się po pierwszej zmianie i zapisaniu artykułu.
        </Alert>
      )}
      {items.map((r) => (
        <Box
          key={r.id}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: 2,
            borderBottom: "1px solid #ddd",
            py: 2,
          }}
        >
          <div>
            <strong>{r.data.title}</strong>
            <p>{new Date(r.created_at).toLocaleString("pl-PL")}</p>
          </div>
          <Button
            disabled={busy}
            onClick={async () => {
              if (
                !record ||
                !window.confirm(
                  "Przywrócić tę wersję? Obecna wersja również zostanie zachowana w historii.",
                )
              )
                return;
              setBusy(true);
              try {
                await provider.update(resource!, {
                  id: record.id,
                  data: r.data,
                  previousData: record,
                });
                notify("Wersja przywrócona");
                refresh();
              } catch (e) {
                notify((e as Error).message, { type: "error" });
              } finally {
                setBusy(false);
              }
            }}
          >
            Przywróć
          </Button>
        </Box>
      ))}
    </Box>
  );
}
function TitleInput() {
  const { getValues, setValue } = useFormContext();
  return (
    <TextInput
      source="title"
      label="Tytuł"
      validate={required()}
      fullWidth
      onBlur={() => {
        if (!getValues("slug")) {
          const title = String(getValues("title") || "");
          const slug = title
            .toLowerCase()
            .replace(/ł/g, "l")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          setValue("slug", slug, { shouldDirty: true });
        }
      }}
    />
  );
}
function MediaPicker() {
  const { data = [] } = useGetList("media", {
    pagination: { page: 1, perPage: 30 },
    sort: { field: "updated_at", order: "DESC" },
  });
  const { setValue } = useFormContext();
  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="body2">
        Wybierz zdjęcie z biblioteki lub wpisz adres poniżej.
      </Typography>
      <Stack direction="row" sx={{ gap: 1, flexWrap: "wrap", mt: 1 }}>
        {data.map((m: any) => (
          <Button
            key={m.id}
            title={m.name}
            onClick={() => {
              setValue("image", m.url, { shouldDirty: true });
              setValue("image_alt", m.alt || "", { shouldDirty: true });
            }}
          >
            <img
              src={m.url}
              alt={m.alt || m.name}
              style={{ width: 80, height: 55, objectFit: "cover" }}
            />
          </Button>
        ))}
      </Stack>
      <Button href="#/media" target="_blank">
        Otwórz bibliotekę mediów ↗
      </Button>
    </Box>
  );
}
function LocalCategoryInput() {
  return (
    <ReferenceInput source="local_category_id" reference="local_categories">
      <SelectInput
        optionText="name"
        label="Kategoria w Sosnowcu"
        helperText="Dodatkowa kategoria lokalnego bloga lub podstrony."
      />
    </ReferenceInput>
  );
}
function PostFields() {
  return [
    <FormTab key="0" label="Treść">
      <TitleInput />
      <LocalCategoryInput />
      <ReferenceArrayInput source="tags" reference="tags">
        <SelectArrayInput
          optionText="name"
          label="Tagi artykułu"
          helperText="Możesz wybrać kilka tagów; nowe dodasz w zakładce Tagi."
        />
      </ReferenceArrayInput>
      <ReferenceInput source="category_id" reference="categories">
        <SelectInput
          optionText="name"
          label="Kategoria"
          validate={required()}
        />
      </ReferenceInput>
      <SelectInput
        source="scope"
        defaultValue="general"
        label="Gdzie pokazać artykuł?"
        choices={[
          { id: "general", name: "Blog ogólny" },
          { id: "sosnowiec", name: "Blog + Z Sosnowca" },
        ]}
        helperText="Kategoria określa temat; oznaczenie Sosnowca dodaje tekst także do lokalnej zakładki."
      />
      <TextInput
        source="slug"
        label="Adres URL"
        validate={required()}
        helperText="Małe litery bez polskich znaków, wyrazy oddzielone myślnikami"
        fullWidth
      />
      <TextInput
        source="excerpt"
        label="Wprowadzenie / zajawka"
        multiline
        fullWidth
      />
      <RichTextInput source="body" label="Treść artykułu" fullWidth />
      <TextInput
        source="sources"
        label="Źródła"
        helperText="Jeden pełny adres HTTPS w każdym wierszu"
        multiline
        fullWidth
      />
    </FormTab>,
    <FormTab key="1" label="Publikacja">
      <SelectInput source="status" label="Status" choices={statuses} />
      <DateTimeInput
        source="published_at"
        label="Termin publikacji (czas Twojego urządzenia)"
        parse={toISO}
      />
      <TextInput source="author" label="Autor" />
      <BooleanInput source="featured" label="Wyróżnij na stronie głównej" />
      <Preview />
      <Alert severity="info">
        Zaplanowany artykuł pojawi się po pierwszym udanym zbudowaniu strony po
        wskazanym terminie. Status „Kosz” ukrywa artykuł; przywrócisz go,
        wybierając inny status.
      </Alert>
    </FormTab>,
    <FormTab key="2" label="Zdjęcie i SEO">
      <MediaPicker />
      <TextInput
        source="image"
        label="Adres zdjęcia"
        helperText="Adres HTTPS albo adres z biblioteki mediów /uploads/…"
        fullWidth
      />
      <TextInput
        source="image_alt"
        label="Opis alternatywny zdjęcia"
        fullWidth
      />
      <BooleanInput source="toc" label="Pokaż spis treści" />
      <BooleanInput
        source="noindex"
        label="Ukryj artykuł w wyszukiwarkach (noindex)"
      />
      <TextInput
        source="canonical_url"
        label="Adres kanoniczny (opcjonalnie)"
        fullWidth
      />
      <TextInput
        source="seo_title"
        label="Tytuł dla wyszukiwarki"
        helperText="Puste pole: użyj tytułu artykułu"
        fullWidth
      />
      <TextInput
        source="seo_description"
        label="Opis dla wyszukiwarki"
        helperText="Puste pole: użyj wprowadzenia"
        multiline
        fullWidth
      />
    </FormTab>,
    <FormTab key="3" label="Historia zmian">
      <Revisions />
    </FormTab>,
  ];
}
function PostEdit() {
  return (
    <Edit mutationMode="pessimistic" title="Edytuj artykuł">
      <TabbedForm>{PostFields()}</TabbedForm>
    </Edit>
  );
}
function PostCreate() {
  return (
    <Create title="Nowy artykuł">
      <TabbedForm
        defaultValues={{
          status: "draft",
          scope: "general",
          author: "Igor Pabiańczyk",
          featured: false,
          tags: [],
          toc: true,
          noindex: false,
          canonical_url: "",
          published_at: null,
          image: "",
          image_alt: "",
          excerpt: "",
          body: "",
          seo_title: "",
          seo_description: "",
          sources: "",
        }}
      >
        {PostFields()}
      </TabbedForm>
    </Create>
  );
}
function CategoryList() {
  return (
    <List sort={{ field: "name", order: "ASC" }}>
      <Datagrid rowClick="edit">
        <TextField source="name" label="Nazwa" />
        <TextField source="slug" label="Adres" />
        <TextField source="description" label="Opis" />
        <EditButton />
      </Datagrid>
    </List>
  );
}
function CategoryFields() {
  return (
    <>
      <TextInput source="name" label="Nazwa" validate={required()} fullWidth />
      <TextInput
        source="slug"
        label="Adres URL"
        validate={required()}
        fullWidth
      />
      <TextInput
        source="description"
        label="Opis kategorii"
        multiline
        fullWidth
      />
    </>
  );
}
function PlaceList() {
  return (
    <List
      title="Pomoc w Sosnowcu"
      filters={[
        <SelectInput
          key="section"
          source="section"
          label="Zakładka"
          choices={[
            { id: "mops", name: "MOPS i działy" },
            { id: "institution", name: "Inne instytucje" },
          ]}
          alwaysOn
        />,
      ]}
    >
      <Datagrid rowClick="edit">
        <TextField source="name" label="Nazwa" />
        <FunctionField
          label="Zakładka"
          render={(r: any) =>
            r.section === "mops" ? "MOPS i działy" : "Inne instytucje"
          }
        />
        <TextField source="address" label="Adres" />
        <TextField source="phone" label="Telefon" />
        <TextField source="verified_at" label="Data weryfikacji" />
        <TextField source="status" label="Status" />
        <EditButton />
      </Datagrid>
    </List>
  );
}
function PlaceFields() {
  return (
    <>
      <Alert severity="info">
        Ta sekcja obejmuje wyłącznie Sosnowiec. Działy dodawaj pod głównym
        wpisem MOPS.
      </Alert>
      <SelectInput
        source="section"
        label="Zakładka"
        choices={[
          { id: "mops", name: "MOPS i działy" },
          { id: "institution", name: "Inne instytucje" },
        ]}
        validate={required()}
      />
      <ReferenceInput
        source="parent_id"
        reference="places"
        filter={{ section: "mops", root: true }}
      >
        <SelectInput
          optionText="name"
          label="Dział należy do"
          helperText="Dla działu wybierz MOPS. Dla głównej instytucji pozostaw puste."
        />
      </ReferenceInput>
      <TextInput
        source="name"
        label="Nazwa instytucji"
        validate={required()}
        fullWidth
      />
      <TextInput source="description" label="Opis" multiline fullWidth />
      <TextInput source="address" label="Adres" fullWidth />
      <TextInput source="phone" label="Telefon" />
      <TextInput source="email" label="E-mail instytucji" />
      <TextInput source="website" label="Oficjalna strona (HTTPS)" fullWidth />
      <TextInput source="verified_at" label="Data sprawdzenia danych" />
      <SelectInput
        source="status"
        label="Status"
        choices={statuses.slice(0, 2)}
      />
    </>
  );
}
function Upload() {
  const refresh = useRefresh();
  const notify = useNotify();
  const [busy, setBusy] = useState(false);
  return (
    <Button component="label" disabled={busy}>
      {busy ? "Przesyłanie…" : "Prześlij zdjęcie"}
      <input
        hidden
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true);
          try {
            const form = new FormData();
            form.append("file", file);
            const result = await fetch("/api/upload", {
              method: "POST",
              body: form,
            });
            const json = (await result.json()) as any;
            if (!result.ok) throw new Error(json.message);
            notify("Zdjęcie zapisane. Skopiuj adres z biblioteki do artykułu.");
            refresh();
          } catch (error) {
            notify((error as Error).message, { type: "error" });
          } finally {
            setBusy(false);
            e.target.value = "";
          }
        }}
      />
    </Button>
  );
}
function MediaList() {
  return (
    <List
      title="Biblioteka mediów"
      actions={
        <TopToolbar>
          <Upload />
          <CreateButton label="Dodaj adres zdjęcia" />
        </TopToolbar>
      }
    >
      <Datagrid rowClick="edit">
        <FunctionField
          label="Podgląd"
          render={(r: any) => (
            <img
              src={r.url}
              alt={r.alt}
              style={{ width: 90, height: 60, objectFit: "cover" }}
            />
          )}
        />
        <TextField source="name" label="Nazwa" />
        <TextField source="url" label="Adres do wklejenia w artykule" />
        <TextField source="alt" label="Opis alternatywny" />
        <EditButton />
      </Datagrid>
    </List>
  );
}
function MediaFields() {
  return (
    <>
      <TextInput source="name" label="Nazwa" fullWidth validate={required()} />
      <TextInput
        source="url"
        label="Adres zdjęcia"
        fullWidth
        validate={required()}
      />
      <TextInput source="alt" label="Opis alternatywny" fullWidth />
    </>
  );
}
function SettingsList() {
  return (
    <List title="Ustawienia bloga" actions={false} pagination={false}>
      <Datagrid bulkActionButtons={false} rowClick="edit">
        <TextField source="title" label="Nazwa" />
        <TextField source="ga_measurement_id" label="Google Analytics 4" />
        <TextField source="contact_email" label="Kontakt" />
        <EditButton />
      </Datagrid>
    </List>
  );
}
function SettingsEdit() {
  return (
    <Edit mutationMode="pessimistic" title="Ustawienia bloga">
      <SimpleForm>
        <TextInput source="title" label="Nazwa bloga" fullWidth />
        <TextInput
          source="description"
          label="Opis bloga"
          fullWidth
          multiline
        />
        <TextInput
          source="contact_email"
          label="Publiczny adres kontaktowy"
          fullWidth
        />
        <TextInput source="about" label="O projekcie" multiline fullWidth />
        <TextInput source="site_url" label="Publiczny adres strony" fullWidth />
        <TextInput
          source="google_verification"
          label="Google Search Console — kod weryfikacyjny"
          fullWidth
        />
        <TextInput
          source="bing_verification"
          label="Bing Webmaster Tools — kod weryfikacyjny"
          fullWidth
        />
        <TextInput
          source="default_image"
          label="Domyślny obraz udostępniania"
          fullWidth
        />
        <BooleanInput
          source="allow_indexing"
          label="Zezwól na indeksowanie publicznej strony"
        />
        <BooleanInput
          source="allow_ai_search"
          label="Publikuj llms.txt (opcjonalny spis dla narzędzi AI)"
        />
        <TextInput
          source="ga_measurement_id"
          label="Identyfikator pomiaru Google Analytics 4"
          helperText="G-XXXXXXXXXX. Pomiar uruchamia się dopiero po zgodzie czytelnika."
          fullWidth
        />
        <Alert severity="info">
          Identyfikator pomiaru włącza zbieranie danych. Raporty Google są
          dostępne w Twoim koncie Analytics i Search Console — zobacz „Google i
          publikacja”.
        </Alert>
      </SimpleForm>
    </Edit>
  );
}
function Integration() {
  return (
    <Card sx={{ m: 2, p: 3, maxWidth: 950 }}>
      <Title title="Google i publikacja" />
      <Typography variant="h4">Google, AI i GitHub Pages</Typography>
      <Typography sx={{ my: 2 }}>
        Publiczne strony są generowane do HTML. Mapa witryny, RSS, archiwa tagów
        i dane strukturalne pomagają wyszukiwarkom rozumieć treść. Indeksacja i
        cytowania przez AI zależą od zewnętrznych usług.
      </Typography>
      <Typography sx={{ my: 2 }}>
        W Ustawieniach wpiszesz identyfikator GA4, token weryfikacyjny Google
        Search Console i Bing. Publiczny panel nie przechowuje kluczy prywatnych
        Google — raporty otwierasz bezpośrednio w swoim koncie.
      </Typography>
      <Button href="https://analytics.google.com/" target="_blank">
        Google Analytics ↗
      </Button>
      <Button href="https://search.google.com/search-console" target="_blank">
        Search Console ↗
      </Button>
      <Button href="https://www.bing.com/webmasters/" target="_blank">
        Bing Webmaster Tools ↗
      </Button>
      <Typography sx={{ my: 2 }}>
        Na GitHub Pages edycja treści odbywa się w Pages CMS. Zapis tworzy
        zmianę w repozytorium i uruchamia publikację. Szkice w publicznym
        repozytorium są widoczne w jego plikach. Publikacja zaplanowana pojawia
        się po pierwszym udanym automatycznym zbudowaniu po terminie.
      </Typography>
      <Button href="https://app.pagescms.org" target="_blank">
        Pages CMS ↗
      </Button>
    </Card>
  );
}
function Metric({ label, value }: { label: string; value: any }) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 130 }}>
      <CardContent>
        <Typography variant="caption" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="h4" sx={{ mt: 1 }}>
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
function Dashboard() {
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    api("/api/admin/analytics").then(setData);
  }, []);
  const e = data?.editorial;
  return (
    <Box sx={{ p: 4 }}>
      <Title title="Redakcja MostPomocy" />
      <Typography variant="overline">GITHUB PAGES · PANEL LOKALNY</Typography>
      <Typography variant="h3" sx={{ fontFamily: "Georgia", mb: 2 }}>
        Dzień dobry, Igor.
      </Typography>
      <Typography sx={{ mb: 3 }}>
        Twórz artykuły, przypisuj tagi i dodawaj własne podstrony. Lokalne
        zmiany zapisują się w plikach projektu.
      </Typography>
      {e && (
        <Stack direction="row" sx={{ gap: 2, flexWrap: "wrap" }}>
          <Metric label="Opublikowane" value={e.published} />
          <Metric label="Szkice" value={e.drafts} />
          <Metric label="Kategorie" value={e.categories} />
          <Metric label="Zaplanowane" value={e.scheduled} />
        </Stack>
      )}
      <Stack direction="row" sx={{ gap: 2, mt: 3, flexWrap: "wrap" }}>
        <Button variant="contained" href="#/posts/create">
          Nowy artykuł
        </Button>
        <Button variant="contained" href="#/pages/create">
          Nowa podstrona
        </Button>
        <Button href="#/tags">Zarządzaj tagami</Button>
        <Button href="/" target="_blank">
          Podgląd strony ↗
        </Button>
      </Stack>
      <Integration />
    </Box>
  );
}
function PageFields() {
  return [
    <FormTab key="content" label="Treść">
      <TitleInput />
      <SelectInput
        source="section"
        label="Sekcja podstrony"
        defaultValue="general"
        choices={[
          { id: "general", name: "Ogólna — /adres/" },
          { id: "sosnowiec", name: "Sosnowiec — /sosnowiec/adres/" },
        ]}
      />
      <LocalCategoryInput />
      <TextInput
        source="notice"
        label="Ważny komunikat / status projektu"
        multiline
        fullWidth
      />
      <TextInput
        source="slug"
        label="Adres podstrony"
        validate={required()}
        helperText="np. wolontariat → /wolontariat/. Adresy systemowe są zarezerwowane."
        fullWidth
      />
      <TextInput source="excerpt" label="Wprowadzenie" multiline fullWidth />
      <RichTextInput source="body" label="Treść podstrony" fullWidth />
      <ReferenceInput source="related_category_id" reference="categories">
        <SelectInput
          optionText="name"
          label="Pokaż artykuły z kategorii (opcjonalnie)"
        />
      </ReferenceInput>
    </FormTab>,
    <FormTab key="publish" label="Publikacja i menu">
      <SelectInput source="status" label="Status" choices={statuses} />
      <DateTimeInput
        source="published_at"
        label="Termin publikacji"
        parse={toISO}
      />
      <BooleanInput source="show_in_nav" label="Dodaj do menu głównego" />
      <TextInput source="menu_label" label="Krótka nazwa w menu" />
      <TextInput
        source="nav_order"
        label="Kolejność w menu (0–100)"
        type="number"
      />
      <Preview />
    </FormTab>,
    <FormTab key="seo" label="Google i SEO">
      <TextInput source="seo_title" label="Tytuł SEO" fullWidth />
      <TextInput
        source="seo_description"
        label="Opis SEO"
        multiline
        fullWidth
      />
      <TextInput
        source="canonical_url"
        label="Adres kanoniczny (opcjonalnie)"
        fullWidth
      />
      <BooleanInput source="noindex" label="Nie indeksuj tej podstrony" />
    </FormTab>,
    <FormTab key="history" label="Historia zmian">
      <Revisions />
    </FormTab>,
  ];
}
function PageList() {
  return (
    <List
      title="Podstrony"
      filters={[<SearchInput source="q" key="q" alwaysOn />]}
    >
      <Datagrid rowClick="edit">
        <TextField source="title" label="Tytuł" />
        <TextField source="slug" label="Adres" />
        <BooleanField source="show_in_nav" label="W menu" />
        <FunctionField
          label="Status"
          render={(r: any) => statusLabel(r.status)}
        />
        <EditButton />
      </Datagrid>
    </List>
  );
}
export default function Editor() {
  return (
    <Admin
      title="MostPomocy · Redakcja"
      dataProvider={dataProvider}
      authProvider={authProvider}
      requireAuth
      i18nProvider={i18n}
      dashboard={Dashboard}
      layout={AdminLayout}
      theme={{
        ...defaultTheme,
        palette: {
          mode: "light",
          primary: { main: "#205b47" },
          secondary: { main: "#205b47" },
          background: { default: "#f5f6f0", paper: "#ffffff" },
        },
        shape: { borderRadius: 10 },
        typography: { fontFamily: "Arial, sans-serif" },
      }}
    >
      <Resource
        name="pages"
        options={{ label: "Podstrony" }}
        icon={ArticleIcon}
        list={PageList}
        edit={() => (
          <Edit mutationMode="pessimistic">
            <TabbedForm>{PageFields()}</TabbedForm>
          </Edit>
        )}
        create={() => (
          <Create>
            <TabbedForm
              defaultValues={{
                status: "draft",
                section: "general",
                show_in_nav: false,
                nav_order: 50,
                body: "",
                excerpt: "",
                noindex: false,
              }}
            >
              {PageFields()}
            </TabbedForm>
          </Create>
        )}
      />
      <Resource
        name="tags"
        options={{ label: "Tagi" }}
        icon={CategoryIcon}
        recordRepresentation="name"
        list={CategoryList}
        edit={() => (
          <Edit mutationMode="pessimistic">
            <SimpleForm>
              <CategoryFields />
            </SimpleForm>
          </Edit>
        )}
        create={() => (
          <Create>
            <SimpleForm>
              <CategoryFields />
            </SimpleForm>
          </Create>
        )}
      />
      <Resource
        name="posts"
        options={{ label: "Artykuły" }}
        icon={ArticleIcon}
        list={PostList}
        edit={PostEdit}
        create={PostCreate}
      />
      <Resource
        name="categories"
        recordRepresentation="name"
        options={{ label: "Kategorie" }}
        icon={CategoryIcon}
        list={CategoryList}
        edit={() => (
          <Edit mutationMode="pessimistic">
            <SimpleForm>
              <CategoryFields />
            </SimpleForm>
          </Edit>
        )}
        create={() => (
          <Create>
            <SimpleForm>
              <CategoryFields />
            </SimpleForm>
          </Create>
        )}
      />
      <Resource
        name="local_categories"
        recordRepresentation="name"
        options={{ label: "Sosnowiec — kategorie" }}
        icon={CategoryIcon}
        list={CategoryList}
        edit={() => (
          <Edit mutationMode="pessimistic">
            <SimpleForm>
              <CategoryFields />
            </SimpleForm>
          </Edit>
        )}
        create={() => (
          <Create>
            <SimpleForm>
              <CategoryFields />
            </SimpleForm>
          </Create>
        )}
      />
      <Resource
        name="places"
        recordRepresentation="name"
        options={{ label: "Pomoc w Sosnowcu" }}
        icon={PlaceIcon}
        list={PlaceList}
        edit={() => (
          <Edit mutationMode="pessimistic">
            <SimpleForm>
              <PlaceFields />
            </SimpleForm>
          </Edit>
        )}
        create={() => (
          <Create>
            <SimpleForm
              defaultValues={{
                city: "Sosnowiec",
                status: "draft",
                section: "institution",
                parent_id: "",
              }}
            >
              <PlaceFields />
            </SimpleForm>
          </Create>
        )}
      />
      <Resource
        name="media"
        options={{ label: "Biblioteka mediów" }}
        icon={ImageIcon}
        list={MediaList}
        edit={() => (
          <Edit mutationMode="pessimistic">
            <SimpleForm>
              <MediaFields />
            </SimpleForm>
          </Edit>
        )}
        create={() => (
          <Create>
            <SimpleForm>
              <MediaFields />
            </SimpleForm>
          </Create>
        )}
      />
      <Resource
        name="settings"
        options={{ label: "Ustawienia" }}
        icon={SettingsIcon}
        list={SettingsList}
        edit={SettingsEdit}
      />
      <CustomRoutes>
        <Route path="statystyki" element={<Dashboard />} />
        <Route path="integracja" element={<Integration />} />
      </CustomRoutes>
    </Admin>
  );
}
