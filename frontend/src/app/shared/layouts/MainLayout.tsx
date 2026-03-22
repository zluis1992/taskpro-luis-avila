"use client";

import {useEffect, useMemo, useState} from "react";
import {usePathname, useRouter} from "next/navigation";
import TreeView from "devextreme-react/tree-view";
import Toolbar, {Item} from "devextreme-react/toolbar";
import Button from "devextreme-react/button";
import {authService} from "@/app/core/services/auth.service";
import {versionService} from "@/app/core/services/version.service";

type NavItem = {
  id: string;
  text: string;
  path?: string;
  icon?: string;
  items?: NavItem[];
};

export function MainLayout({children}: {children: React.ReactNode}) {
  const router = useRouter();
  const pathname = usePathname();
  const user = authService.getCurrentUser();
  const [menuOpened, setMenuOpened] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [appVersion, setAppVersion] = useState("v1.0.0");

  useEffect(() => {
    setMounted(true);
    versionService.get().then((v) => setAppVersion(`v${v.version}`)).catch(() => {});
    const mq = window.matchMedia("(max-width: 768px)");
    const update = (mobile: boolean) => {
      setIsMobile(mobile);
      if (mobile) setMenuOpened(false);
      else setMenuOpened(true);
    };
    update(mq.matches);
    const handler = (e: MediaQueryListEvent) => update(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const navigationItems: NavItem[] = useMemo(
    () => [
      {id: "dashboard", text: "Dashboard", path: "/dashboard", icon: "home"},
      {id: "projects", text: "Proyectos", path: "/projects", icon: "folder"},
      {id: "tasks", text: "Tareas", path: "/tasks", icon: "checklist"},
      {id: "users", text: "Usuarios", path: "/users", icon: "user"},
    ],
    [],
  );

  function handleLogout() {
    authService.logout();
    router.push("/login");
  }

  function handleItemClick(e: unknown) {
    const event = e as {itemData?: unknown};
    const item = event.itemData as NavItem | undefined;
    if (item?.path) {
      router.push(item.path);
      if (isMobile) setMenuOpened(false);
    }
  }

  const selectedItemKeys = useMemo(() => {
    const found = navigationItems.find((i) => i.path === pathname);
    return found ? [found.id] : [];
  }, [navigationItems, pathname]);

  return (
    <div className="taskpro-app">
      {/* Header */}
      <div className="taskpro-header">
        <Toolbar>
          <Item
            location="before"
            widget="dxButton"
            options={{
              icon: "menu",
              stylingMode: "text",
              onClick: () => setMenuOpened((v) => !v),
            }}
          />
          <Item
            location="before"
            render={() => <span className="taskpro-brand">TaskPro</span>}
          />
          <Item
            location="after"
            render={() => (
              <div className="taskpro-user-info">
                <span className="taskpro-user-name">{user?.name ?? ""}</span>
                <span className="taskpro-user-role">{user?.role ?? ""}</span>
              </div>
            )}
          />
          <Item
            location="after"
            render={() => (
              <Button
                className="taskpro-logout-btn"
                icon="runner"
                text="Salir"
                stylingMode="text"
                onClick={handleLogout}
              />
            )}
          />
        </Toolbar>
      </div>

      {/* Sidebar */}
      {mounted && (
        <>
          {isMobile && menuOpened && (
            <div
              className="taskpro-overlay"
              onClick={() => setMenuOpened(false)}
            />
          )}
          <div
            className={`taskpro-sidebar${menuOpened ? " open" : ""}${isMobile ? " mobile" : " desktop"}`}>
            <div className="taskpro-sidebar-nav">
              <TreeView
                items={navigationItems}
                keyExpr="id"
                selectionMode="single"
                selectedItemKeys={selectedItemKeys}
                focusStateEnabled={false}
                onItemClick={handleItemClick}
                itemRender={(item: NavItem) => (
                  <div className="taskpro-nav-item">
                    <i
                      className={`dx-icon dx-icon-${item.icon ?? "bulletlist"}`}
                    />
                    {menuOpened && (
                      <span className="taskpro-nav-label">{item.text}</span>
                    )}
                  </div>
                )}
              />
            </div>
          </div>
        </>
      )}

      {/* Contenido */}
      <div
        className="taskpro-content"
        style={
          !mounted || (isMobile && menuOpened)
            ? undefined
            : {marginLeft: menuOpened ? 260 : 56}
        }>
        <div className="taskpro-main">{children}</div>
        <footer className="taskpro-footer">
          <span>© 2026 TaskPro. Created with ❤️ By Luis A.</span>
          <span className="taskpro-footer-version">{appVersion}</span>
        </footer>
      </div>
    </div>
  );
}
