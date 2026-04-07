<template>
  <UDashboardGroup>
    <AdminSidebar />

    <UDashboardPanel :ui="{ body: 'min-h-0' }">
      <template #body>
        <slot />
      </template>
    </UDashboardPanel>
  </UDashboardGroup>
</template>
