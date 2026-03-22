'use client';

import { config } from 'devextreme/common';
import { locale, loadMessages } from 'devextreme/localization';
import * as esMessages from 'devextreme/localization/messages/es.json';

config({ licenseKey: process.env.NEXT_PUBLIC_DEVEXTREME_LICENSE_KEY });
loadMessages(esMessages);
locale('es');

export function DevExtremeLicenseProvider() {
  return null;
}
