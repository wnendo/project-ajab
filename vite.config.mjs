import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'pages/login.html'),
        dashboard: resolve(__dirname, 'pages/dashboard.html'),
        register: resolve(__dirname, 'pages/register.html'),
        profile: resolve(__dirname, 'pages/profile.html'),
        completeProfile: resolve(__dirname, 'pages/complete-profile.html'),
        tournamentForm: resolve(__dirname, 'pages/tournament-form.html'),
        tournamentManage: resolve(__dirname, 'pages/tournament-manage.html'),
        usersAdmin: resolve(__dirname, 'pages/users-admin.html'),
        paymentPix: resolve(__dirname, 'pages/payment-pix.html'),
      },
    },
  },
});