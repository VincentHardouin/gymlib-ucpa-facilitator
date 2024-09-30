import passkit from 'passkit-generator';
import { config } from '../../config.js';
import { jsonWebTokenService } from './JsonWebTokenService.js';
import { passCertificatesAdapter } from './PassCertificatesAdapter.js';

const PKPass = passkit.PKPass;

class PassAdapter {
  constructor({ passCertificatesAdapter, PKPass, baseURL, jsonWebTokenService, config }) {
    this.passCertificatesAdapter = passCertificatesAdapter;
    this.PKPass = PKPass;
    this.baseURL = baseURL;
    this.jsonWebTokenService = jsonWebTokenService;
    this.config = config;
  }

  async get({ title, start, court, code, serialNumber, passTypeIdentifier }) {
    this.certificates = await this.passCertificatesAdapter.get();
    const token = await this.jsonWebTokenService.generateToken({});
    this.pass = await this.PKPass.from(
      {
        model: './model.pass',
        certificates: this.certificates,
      },
      {
        serialNumber,
        passTypeIdentifier,
        teamIdentifier: this.config.teamIdentifier,
        logoText: title,
        relevantDate: start,
        webServiceURL: this.baseURL,
        authenticationToken: token,
      },
    );

    this.pass.primaryFields.push(
      {
        key: 'date',
        label: 'date',
        value: start,
        dateStyle: 'PKDateStyleMedium',
      },
      {
        key: 'time',
        label: 'time',
        value: start,
        timeStyle: 'PKDateStyleShort',
      },
    );

    this.pass.secondaryFields.push(
      {
        key: 'court',
        label: 'court',
        value: court,
      },
    );

    this.pass.auxiliaryFields.push({
      key: 'code',
      label: 'code',
      value: code,
    });

    this.pass.setBarcodes({
      message: code,
      format: 'PKBarcodeFormatQR',
    });
    return this.pass.getAsBuffer();
  }
}

export const passAdapter = new PassAdapter({ passCertificatesAdapter, PKPass, baseURL: config.baseURL, jsonWebTokenService, config: config.pass });
