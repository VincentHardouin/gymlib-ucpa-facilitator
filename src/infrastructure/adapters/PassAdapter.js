import passkit from 'passkit-generator';
import { config } from '../../../config.js';
import { jsonWebTokenAdapter } from './JsonWebTokenAdapter.js';
import { certificatesAdapter } from './CertificatesAdapter.js';

const PKPass = passkit.PKPass;

class PassAdapter {
  constructor({ certificatesAdapter, PKPass, baseURL, jsonWebTokenAdapter, config }) {
    this.certificatesAdapter = certificatesAdapter;
    this.PKPass = PKPass;
    this.baseURL = baseURL;
    this.jsonWebTokenAdapter = jsonWebTokenAdapter;
    this.config = config;
  }

  async get({ title, start, court, code, serialNumber, passTypeIdentifier }) {
    this.certificates = await this.certificatesAdapter.getForPass();
    const token = await this.jsonWebTokenAdapter.generateToken({});
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
        webServiceURL: this.baseURL,
        authenticationToken: token,
        maxDistance: 100,
        relevantDate: start,
        semantics: {
          eventStartDate: start.toISOString(),
          eventEndDate: new Date(new Date(start).setHours(start.getHours() + 1)).toISOString(),
          duration: 3600,
        },
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

export const passAdapter = new PassAdapter({ certificatesAdapter, PKPass, baseURL: config.baseURL, jsonWebTokenAdapter, config: config.apple });
