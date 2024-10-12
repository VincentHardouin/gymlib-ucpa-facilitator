import passkit from 'passkit-generator';
import { config } from '../../../config.js';
import { certificatesAdapter } from './CertificatesAdapter.js';
import { jsonWebTokenAdapter } from './JsonWebTokenAdapter.js';

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
        relevantDate: start,
        maxDistance: 50,
        locations: [
          {
            latitude: 48.896370,
            longitude: 2.371645,
          },
        ],
        semantics: {
          eventStartDate: start.toISOString(),
          eventEndDate: new Date(new Date(start).setHours(start.getHours() + 1)).toISOString(),
          duration: 3600,
        },
      },
    );

    this.pass.primaryFields.push(
      {
        key: 'court',
        label: 'court',
        textAlignment: 'PKTextAlignmentLeft',
        value: court,
      },
    );

    this.pass.secondaryFields.push(
      {
        key: 'event_date',
        label: 'date',
        value: start,
        ignoresTimeZone: false,
        dateStyle: 'PKDateStyleMedium',
        textAlignment: 'PKTextAlignmentLeft',
      },
      {
        key: 'event_time',
        label: 'time',
        textAlignment: 'PKTextAlignmentRight',
        timeStyle: 'PKDateStyleShort',
        ignoresTimeZone: false,
        value: start,
      },
    );

    this.pass.backFields.push({
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
