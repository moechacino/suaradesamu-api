type Voter = {
  nfsSerialNumber: string;
  name: string;
  NIK: string;
  PIN: string;
};

const nfcSN = [
  "7B:Q3:WB:F1:IU",
  "67:58:U4:AE:58",
  "M4:FE:VI:FV:X1",
  "EEA5QOU4A4",
  "V5TY4AML2C",
  "O1Y6NBCMNS",
];

const pinVoter = ["183562", "093516", "546217", "452617", "562846", "956371"];
// function regexify(pattern: string): string {
//   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
//   return pattern.replace(/\[A-Z0-9\]\{2\}/g, () => {
//     return (
//       chars.charAt(Math.floor(Math.random() * chars.length)) +
//       chars.charAt(Math.floor(Math.random() * chars.length))
//     );
//   });
// }
// async function getuid(): Promise<string> {
//   let uid: string;

//   const segments: string[] = [];
//   for (let i = 0; i < 5; i++) {
//     segments.push(regexify("[A-Z0-9]{2}"));
//   }
//   uid = segments.join(":");

//   return uid;
// }
export const dumpVoter: Voter[] = [
  {
    nfsSerialNumber: "043E0C22DF5D80",
    name: "Priyono NFC",
    NIK: "350204087862271",
    PIN: "111111",
  },
  {
    nfsSerialNumber: "95F3BCAB",
    name: "Supardi NFC",
    NIK: "350204087862272",
    PIN: "222222",
  },
  {
    nfsSerialNumber: "047641C2E55B80",
    name: "Alvian NFC",
    NIK: "350204087862273",
    PIN: "333333",
  },
  {
    nfsSerialNumber: "02B0A141501BB0",
    name: "Kenalan Nayla",
    NIK: "350204087862274",
    PIN: "444444",
  },
  {
    nfsSerialNumber: "0473628AD15D80",
    name: "Keluarga Nayla 1",
    NIK: "350204087862275",
    PIN: "555555",
  },
  {
    nfsSerialNumber: "05810E4002B200",
    name: "Keluarga Nayla 2",
    NIK: "350204087862276",
    PIN: "666666",
  },
  {
    nfsSerialNumber: "0440483A8C6680",
    name: "Salsa",
    NIK: "3502040878622762",
    PIN: "777777",
  },
  {
    nfsSerialNumber: "044749A2912980",
    name: "GM",
    NIK: "3502040878622761",
    PIN: "888888",
  },
  {
    nfsSerialNumber: "04103772686A80",
    name: "Ryandira",
    NIK: "3502040878622760",
    PIN: "999999",
  },
];
