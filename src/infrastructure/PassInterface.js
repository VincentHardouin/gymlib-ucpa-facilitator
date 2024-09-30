export class PassInterface {
  constructor({ passController, authService }) {
    this.passController = passController;
    this.authService = authService;
  }

  register(server) {
    server.route([
      {
        method: 'POST',
        path: `/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}`,
        options: {
          pre: [{ method: (request, h) => { return this.authService.validateFromPass(request, h); } }],
          handler: async (request, h) => {
            // cf: https://developer.apple.com/documentation/walletpasses/register-a-pass-for-update-notifications
            return this.passController.register(request, h);
          },
          tags: ['api', 'pass'],
        },
      },
      {
        method: 'GET',
        path: '/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}',
        options: {
          handler: async (request, h) => {
            // cf: https://developer.apple.com/documentation/walletpasses/get-the-list-of-updatable-passes
            const { passesUpdatedSince } = request.query;
          },
          tags: ['api', 'pass'],
        },
      },
      {
        method: 'GET',
        path: '/v1/passes/{passTypeIdentifier}/{serialNumber}',
        options: {
          pre: [{ method: (request, h) => { return this.authService.validateFromPass(request, h); } }],
          handler: async (request, h) => {
            // cf: https://developer.apple.com/documentation/walletpasses/send-an-updated-pass
          },
          tags: ['api', 'pass'],
        },
      },
      {
        method: 'DELETE',
        path: '/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}/{serialNumber}',
        options: {
          pre: [{ method: (request, h) => { return this.authService.validateFromPass(request, h); } }],
          handler: async (request, h) => {
            // cf: https://developer.apple.com/documentation/walletpasses/unregister-a-pass-for-update-notifications
            return this.passController.unregister(request, h);
          },
          tags: ['api', 'pass'],
        },
      },
    ]);
  }
}
