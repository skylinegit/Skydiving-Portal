export interface FormDocument {
  id: string;
  title: string;
  filename: string;
}

export interface FormGroup {
  id: string;
  label: string;
  documents: FormDocument[];
}

export const formsContent = {
  heading: 'You must print these out and take them with you on jump day',
  intro:
    'We provide the medical form in PDF format. You will be required to print form 115A off, complete and sign, and take it with you on the day of your jump. Please note if you do not have any of the medical conditions listed on form 115A you DO NOT need to have your form signed by a doctor. If you are unable to print your medical form, please email Skyline on info@skylineevents.co.uk and we can send you a form in the post.',
  groups: [
    {
      id: 'medical',
      label: 'Download as PDF',
      documents: [
        {
          id: '115a',
          title: 'Tandem Jump Medical Information & Declaration 115A',
          filename: 'skyline-115a.pdf',
        },
        {
          id: '115b',
          title: 'Tandem Jump Medical Certificate 115B',
          filename: 'skyline-115b.pdf',
        },
      ],
    },
    {
      id: 'parental',
      label: 'Download as PDF',
      documents: [
        {
          id: 'parental-consent',
          title: 'Parental Consent Membership Form (PDF)',
          filename: 'skyline-parental-consent.pdf',
        },
      ],
    },
  ] satisfies FormGroup[],
  closing:
    'If you are under 18 you will need a parent or guardian to sign the Parental Consent Membership Form. Please download, print and sign this form, and bring it with you on the day of your jump. If you have one of the conditions listed on form 115A, it does not necessarily mean that you cannot jump but you will need to get your medical form 115B signed by your doctor and bring it with you on the day of the jump.',
  contactEmail: 'info@skylineevents.co.uk',
};
