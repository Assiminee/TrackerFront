import {Injectable} from '@angular/core';
import {ReportData} from '../interfaces/report-data.interface';
import {Editor} from '../interfaces/editor.interface';
import {SheetInfo} from '../models/report/shared/sheet-info.interface';
import {ReportTemplate} from '../models/report/templates/report-template.interface';
import {PMInfo} from '../models/report/shared/pm-info.interface';
import {Row} from '../models/report/base/row.interface';
import {Sheet} from '../models/report/shared/sheet.interface';

@Injectable({
  providedIn: 'root'
})
export class MockDataService {
  private mockReports: ReportData[] = [
    {
      id: "rpt-001",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    },
    {
      id: "rpt-002",
      title: "Inventory Audit Q3",
      createdAt: new Date(2023, 5, 2, 12, 55, 23),
      updatedAt: new Date(2024, 6, 14, 11, 17, 22, 44),
      creator: "Rania Bouabid",
    },
    {
      id: "rpt-003",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    },
    {
      id: "rpt-004",
      title: "Inventory Audit Q3",
      createdAt: new Date(2023, 5, 2, 12, 55, 23),
      updatedAt: new Date(2024, 6, 14, 11, 17, 22, 44),
      creator: "Rania Bouabid",
    },
    {
      id: "rpt-005",
      title: "Monthly Sales (July 2025)",
      createdAt: new Date(2024, 11, 10, 12, 55, 23),
      updatedAt: new Date(2025, 6, 14, 11, 17, 22, 44),
      creator: "Yasmine Znatni",
    }
  ];

  private pmInfo: PMInfo = {id: "ff7e0685-2b3f-466b-8685-13b027aae943", firstName: "Lotte", lastName: "Leopold"};

  private editors: Editor[] = [
    {userId: "ff7e0685-2b3f-466b-8685-13b027aae943", firstName: "Lotte", lastName: "Leopold"},
    {userId: "cd81a523-cbf1-4389-9c48-a0914f7acdfa", firstName: "Joanna", lastName: "Kezourec"},
    {userId: "69fad250-9752-4033-b7ce-db8138959407", firstName: "Lester", lastName: "Thairs"},
    {userId: "6d5981d8-f249-49e7-9d11-4cc81a46a70a", firstName: "Cletus", lastName: "Figger"},
    {userId: "c87f3f8c-fcbc-47a1-b3c5-e21fb4bfb2a0", firstName: "Tabor", lastName: "Sabater"},
    {userId: "759560aa-e5d8-4352-a926-aa7d19615eb5", firstName: "Verine", lastName: "Carnie"},
    {userId: "0f6ced33-96c5-49af-8d35-5fb6ae234f72", firstName: "Phyllis", lastName: "Halms"},
    {userId: "4470d6a0-077a-4035-95e3-046218d124ee", firstName: "Costanza", lastName: "Flanigan"},
    {userId: "7a4e497f-c5ff-41d5-9e96-245051e9352c", firstName: "Mallory", lastName: "Ransley"},
    {userId: "125b96fc-952a-47ce-9a1c-a1f10654155e", firstName: "Inge", lastName: "Madden"},
    {userId: "d79e66bf-906a-49e5-9411-b3f0e531fd13", firstName: "Blair", lastName: "Gladhill"},
    {userId: "17de3ba1-fa54-42f8-beb4-06838eea9dc8", firstName: "Michaella", lastName: "Brockett"},
    {userId: "c1fa5042-5632-4144-ad8a-e44a526849e4", firstName: "Pincas", lastName: "McGennis"},
    {userId: "31a82dcd-002a-4dfc-8aee-faed1aac1271", firstName: "Lev", lastName: "Nerheny"},
    {userId: "991c43a6-6b57-4c4b-85a6-624f350f8e39", firstName: "Kore", lastName: "Baitson"},
    {userId: "fc01e5bd-94a7-4366-8b42-c18a319d5d3e", firstName: "Brion", lastName: "Ahrendsen"},
    {userId: "7b315b32-0e6e-43df-ace5-05b948d19428", firstName: "Trude", lastName: "Doelle"},
    {userId: "ba44b371-9332-4508-8364-4cb515878fda", firstName: "Celka", lastName: "Proswell"},
    {userId: "1de302e9-c952-4e50-bfd8-b60d64db19fa", firstName: "Torre", lastName: "Chatwin"},
    {userId: "f70bb6df-7e13-4905-b27e-5f37805841b6", firstName: "Steward", lastName: "Phizacklea"}
  ];

  private sheetId = "68f54419-a077-4f59-9488-54294ba80f22";

  private sheetInfo: SheetInfo[] = [
    {sheetTemplateId: this.sheetId, name: "Alcelaphus buselaphus caama"},
    {sheetTemplateId: "29bc97a9-85c8-4b93-82ce-c8668f86ccb3", name: "Loris tardigratus"},
    {sheetTemplateId: "00a7f0a5-87a5-4e54-b5f0-6a9e377b0ba7", name: "Macropus rufogriseus"},
    {sheetTemplateId: "25f2c875-d605-4059-b3a7-ea5272c0eb50", name: "Lophoaetus occipitalis"},

    {sheetTemplateId: "ae4c8d2b-932f-4f97-ab1b-b2c85e2f8cbf", name: "Dipodomys deserti"},
    {sheetTemplateId: "28f5fd27-6316-4f3d-8f92-88cf16dec041", name: "Uraeginthus granatina"},

    {sheetTemplateId: "247948b8-03f2-4d95-b64d-9f6ccbbce316", name: "Oreamnos americanus"},
    {sheetTemplateId: "ccc626e1-3282-4477-b8de-99ed1776c002", name: "Anathana ellioti"},
    {sheetTemplateId: "738b589e-8746-4f6e-8fb4-92522098902b", name: "Thamnolaea cinnmomeiventris"},
    {sheetTemplateId: "a29f0ef2-3406-48a4-b507-6ff3393f40d5", name: "Gazella granti"},
    {sheetTemplateId: "54950b63-83dc-4ba6-a921-3bcf074341cd", name: "Lorythaixoides concolor"},
    {sheetTemplateId: "02099d21-dd2f-4536-9eb0-e4d1f4753f1a", name: "Paroaria gularis"},

    {sheetTemplateId: "8bafdfc7-e49d-4461-b0ce-4b3d877c1e54", name: "Cacatua tenuirostris"},
    {sheetTemplateId: "f5935e26-d800-4d20-8c81-beead2057300", name: "Butorides striatus"},
    {sheetTemplateId: "18720825-5221-42ce-a34f-54e2c2c585fb", name: "Sagittarius serpentarius"},

    {sheetTemplateId: "49f3246f-0037-4753-92e2-a3f936458047", name: "Macaca radiata"},
    {sheetTemplateId: "b7036428-2439-4b1e-a1a5-f311504367ce", name: "Dusicyon thous"},
  ]

  private mockReportData: ReportTemplate[] = [
    {
      id: "cef74850-bd9b-48b3-9b35-6534c1d11a02",
      name: "Laval-Entrammes Airport",
      description: "All ingredients needed to make your own sushi",
      createdAt: new Date(2024, 1, 25),
      updatedAt: new Date(2025, 9, 1),
      owner: this.pmInfo,
      sheetTemplates: [
        {sheetTemplateId: this.sheetId, name: "Alcelaphus buselaphus caama"},
        {sheetTemplateId: "29bc97a9-85c8-4b93-82ce-c8668f86ccb3", name: "Loris tardigratus"},
        {sheetTemplateId: "00a7f0a5-87a5-4e54-b5f0-6a9e377b0ba7", name: "Macropus rufogriseus"},
        {sheetTemplateId: "25f2c875-d605-4059-b3a7-ea5272c0eb50", name: "Lophoaetus occipitalis"}
      ],
      sheetTemplatesCount: 4,
      isDeleted: false
    },
    {
      id: "11ed7880-8a24-490d-990a-8468f48b87b5",
      name: "Zhanjiang Airport",
      description: "Rich and flavorful tomato sauce for pasta or pizza.",
      createdAt: new Date(2024, 8, 17),
      updatedAt: new Date(2025, 2, 16),
      owner: this.pmInfo,
      sheetTemplates: [
        {sheetTemplateId: "ae4c8d2b-932f-4f97-ab1b-b2c85e2f8cbf", name: "Dipodomys deserti"},
        {sheetTemplateId: "28f5fd27-6316-4f3d-8f92-88cf16dec041", name: "Uraeginthus granatina"}
      ],
      sheetTemplatesCount: 2,
      isDeleted: false
    },
    {
      id: "3b42398b-77e7-43ef-a4ce-5ed1fc1b9e33",
      name: "Miyanmin Airport",
      description: "Folding massage table for professional or home use.",
      createdAt: new Date(2024, 10, 11),
      updatedAt: new Date(2025, 9, 2),
      owner: this.pmInfo,
      sheetTemplates: [
        {sheetTemplateId: "247948b8-03f2-4d95-b64d-9f6ccbbce316", name: "Oreamnos americanus"},
        {sheetTemplateId: "ccc626e1-3282-4477-b8de-99ed1776c002", name: "Anathana ellioti"},
        {sheetTemplateId: "738b589e-8746-4f6e-8fb4-92522098902b", name: "Thamnolaea cinnmomeiventris"},
        {sheetTemplateId: "a29f0ef2-3406-48a4-b507-6ff3393f40d5", name: "Gazella granti"},
        {sheetTemplateId: "54950b63-83dc-4ba6-a921-3bcf074341cd", name: "Lorythaixoides concolor"},
        {sheetTemplateId: "02099d21-dd2f-4536-9eb0-e4d1f4753f1a", name: "Paroaria gularis"}
      ],
      sheetTemplatesCount: 6,
      isDeleted: false
    },
    {
      id: "7b0d65e2-f693-450b-a0a0-b74180497115",
      name: "Sheghnan Airport",
      description: "Portable coffee maker for rich brews on the go.",
      createdAt: new Date(2024, 5, 22),
      updatedAt: new Date(2025, 8, 22),
      owner: this.pmInfo,
      sheetTemplates: [
        {sheetTemplateId: "8bafdfc7-e49d-4461-b0ce-4b3d877c1e54", name: "Cacatua tenuirostris"},
        {sheetTemplateId: "f5935e26-d800-4d20-8c81-beead2057300", name: "Butorides striatus"},
        {sheetTemplateId: "18720825-5221-42ce-a34f-54e2c2c585fb", name: "Sagittarius serpentarius"}
      ],
      sheetTemplatesCount: 3,
      isDeleted: false
    },
    {
      id: "cb5af16e-a310-4f87-8a32-ba67eb91c14f",
      name: "Willow Run Airport",
      description: "Crispy and crunchy snack made from assorted vegetables.",
      createdAt: new Date(2024, 11, 5),
      updatedAt: new Date(2025, 7, 16),
      owner: this.pmInfo,
      sheetTemplates: [
        {sheetTemplateId: "49f3246f-0037-4753-92e2-a3f936458047", name: "Macaca radiata"},
        {sheetTemplateId: "b7036428-2439-4b1e-a1a5-f311504367ce", name: "Dusicyon thous"},
      ],
      sheetTemplatesCount: 2,
      isDeleted: false
    }
  ];

  private tableId = "30b45c13-de80-465b-bcb4-f510288ac5bd"
  private MENTHHOL = "7b08dd98-bcf2-4570-987d-9bef47530e14";
  private MENTHOL_SUBCOL_1 = "be1fcbc3-4212-488a-bf8f-27c6e506ec38";
  private MENTHOL_SUBCOL_2 = "1fe6d858-540c-4e8c-8e1f-d806af1605f2";
  private BACITRACIN = "01be5bce-6283-46ea-b6fe-b36766358a9b";
  private OXYGEN = "e4a9a9f7-cc80-4d8b-8163-bfa0d654d720";
  private EZETIMIBE = "391696ec-49ec-4be1-86e2-70627d271660";
  private EZETIMIBE_SUBCOL_1 = "7a7a72e9-8672-4fca-8b2d-a70b0030e223";
  private EZETIMIBE_SUBCOL_2 = "219c0c75-b224-4f80-ba34-3bcbd8356d05";
  private EZETIMIBE_SUBCOL_3 = "f0384959-c023-4f4c-b776-e4c9ce2412ed";
  private CEFACLOR = "c905514e-76aa-4594-9af0-e25a0c16b42a";
  private IBUPROFEN = "b92e9354-c2a3-4122-aa36-48bd48a26cc6";

  private rows: Row[] = [
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[0],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "Alpha" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "Beta" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "Sample ointment" },
        { columnId: this.OXYGEN, subColumnId: null, value: "O₂ High" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "10mg" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "20mg" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "30mg" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "Cefaclor-500" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "Ibuprofen-200" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[1],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "YASMINE" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "IMANE" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "YASSIN" },
        { columnId: this.OXYGEN, subColumnId: null, value: "ISMAIL" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "MAJIDA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "HAMID" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "NAIMA" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "YASMINE" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "ISMAIL" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[2],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "ABDELILAH" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "HAMZA" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "RANIA" },
        { columnId: this.OXYGEN, subColumnId: null, value: "SAAD" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "HIBA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "HAMZA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "RANIA" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "SAAD" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "HIBA" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[3],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "I" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "II" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "III" },
        { columnId: this.OXYGEN, subColumnId: null, value: "IV" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "V" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "VI" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "VII" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "VIII" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "IX" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[4],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "CHAT-GPT" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "GEMINI" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "SUNO" },
        { columnId: this.OXYGEN, subColumnId: null, value: "GROK" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "CHAT-GPT" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "GEMINI" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "SUNO" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "GROK" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "CHAT-GPT" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[5],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "CHINA" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "GHANA" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "USA" },
        { columnId: this.OXYGEN, subColumnId: null, value: "FRANCE" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "SWEDEN" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "SAUDI ARABIA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "MOROCCO" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "EGYPT" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "LIBYA" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[6],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "AL HOCEIMA" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "FES" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "TANGIER" },
        { columnId: this.OXYGEN, subColumnId: null, value: "CASABLANCA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "RABAT" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "TAZA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "SOUK LARBAA" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "TETOUAN" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "MARTIL" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[7],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "MALTA" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "UKRAINE" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "RUSSIA" },
        { columnId: this.OXYGEN, subColumnId: null, value: "JAPAN" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "IRAN" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "BRAZIL" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "MAXICO" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "NEPAL" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "GREAT BRITAIN" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[8],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "ONE" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "TWO" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "THREE" },
        { columnId: this.OXYGEN, subColumnId: null, value: "FOUR" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "FIVE" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "SIX" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "SEVEN" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "EIGHT" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "NINE" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[9],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "C++" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "C#" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "C" },
        { columnId: this.OXYGEN, subColumnId: null, value: "PYTHON" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "JAVA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "RUBY" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "GO" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "RUST" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "JS/TS" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[10],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "CONST" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "LET" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "INT" },
        { columnId: this.OXYGEN, subColumnId: null, value: "FLOAT" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "DOUBLE" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "STRING" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "BIGINT" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "BLOB" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "FILE" }
      ]
    },
    {
      id: "f3f9a0f1-2f85-4c58-bd94-1d51c8d4d001",
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      tableId: this.tableId,
      sheetId: this.sheetId,
      editor: this.editors[11],
      cells: [
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_1, value: "I AM" },
        { columnId: this.MENTHHOL, subColumnId: this.MENTHOL_SUBCOL_2, value: "TIRED" },
        { columnId: this.BACITRACIN, subColumnId: null, value: "OF GENERATING" },
        { columnId: this.OXYGEN, subColumnId: null, value: "ROW DATA" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_1, value: "FOR THIS" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_2, value: "GODDAMN" },
        { columnId: this.EZETIMIBE, subColumnId: this.EZETIMIBE_SUBCOL_3, value: "TABLE" },
        { columnId: this.CEFACLOR, subColumnId: null, value: "MAKE IT STOP" },
        { columnId: this.IBUPROFEN, subColumnId: null, value: "ALREADY" }
      ]
    }
  ]

  private sheets: Sheet[] = [
    {
      id: this.sheetId,
      createdAt: new Date(2024, 11, 28),
      updatedAt: new Date(2025, 6, 28),
      name: "Alcelaphus buselaphus caama",
      columnCount: 50,
      rowCount: 50,
      tables: [
        {
          id: "615f93c9-9de1-4591-82ca-f1f83102672c",
          startingRow: 0,
          endingRow: 7,
          startingColumn: 27,
          endingColumn: 35,
          hasSubColumns: false,
          columns: [
            {
              id: "07b52fba-8a25-4a17-9e4f-1a0b85319d9b",
              columnName: "ALCOHOL",
              columnIndex: 27,
              subColumns: []
            },
            {
              id: "5c34addb-4d90-43ae-8269-edeea1352247",
              columnName: "Meclizine HCl",
              columnIndex: 28,
              subColumns: []
            },
            {
              id: "5578427e-8555-4d2f-8b1c-d0536c36031c",
              columnName: "Ciclopirox Olamine",
              columnIndex: 29,
              subColumns: []
            },
            {
              id: "8f2f6a0c-e775-4eda-a9da-5480180c361f",
              columnName: "Avobenzone, Octinoxate, and Octisalate",
              columnIndex: 30,
              subColumns: []
            },
            {
              id: "cf6a5d1e-fbda-4ec4-a6bc-26582161557c",
              columnName: "Amiodarone Hydrochloride",
              columnIndex: 31,
              subColumns: []
            },
            {
              id: "abcdbfdb-ce35-4e2e-a95c-b3bf39ad7002",
              columnName: "Phenylephrine HCl",
              columnIndex: 32,
              subColumns: []
            },
            {
              id: "5c19bd9f-8f5a-4eab-a881-69a91f2ff93f",
              columnName: "ALUMINUM CHLOROHYDRATE",
              columnIndex: 33,
              subColumns: []
            },
            {
              id: "b4be4634-fc50-4431-a90e-8ff0fc420dd3",
              columnName: "Fusarium compactum",
              columnIndex: 34,
              subColumns: []
            },
            {
              id: "e90d35be-c02c-49c8-ac65-4558bf30bf59",
              columnName: "Etodolac",
              columnIndex: 35,
              subColumns: []
            }
          ]
        },
        {
          id: "726g04d0-0ef2-5602-93db-g2g94213783d",
          startingRow: 0,
          endingRow: 7,
          startingColumn: 14,
          endingColumn: 22,
          hasSubColumns: false,
          columns: [
            {
              id: "07b52fba-8a25-4a17-9e4f-1a0b85319d9b",
              columnName: "ALCOHOL",
              columnIndex: 14,
              subColumns: []
            },
            {
              id: "5c34addb-4d90-43ae-8269-edeea1352247",
              columnName: "Meclizine HCl",
              columnIndex: 15,
              subColumns: []
            },
            {
              id: "5578427e-8555-4d2f-8b1c-d0536c36031c",
              columnName: "Ciclopirox Olamine",
              columnIndex: 16,
              subColumns: []
            },
            {
              id: "8f2f6a0c-e775-4eda-a9da-5480180c361f",
              columnName: "Avobenzone, Octinoxate, and Octisalate",
              columnIndex: 17,
              subColumns: []
            },
            {
              id: "cf6a5d1e-fbda-4ec4-a6bc-26582161557c",
              columnName: "Amiodarone Hydrochloride",
              columnIndex: 18,
              subColumns: []
            },
            {
              id: "abcdbfdb-ce35-4e2e-a95c-b3bf39ad7002",
              columnName: "Phenylephrine HCl",
              columnIndex: 19,
              subColumns: []
            },
            {
              id: "5c19bd9f-8f5a-4eab-a881-69a91f2ff93f",
              columnName: "ALUMINUM CHLOROHYDRATE",
              columnIndex: 20,
              subColumns: []
            },
            {
              id: "b4be4634-fc50-4431-a90e-8ff0fc420dd3",
              columnName: "Fusarium compactum",
              columnIndex: 21,
              subColumns: []
            },
            {
              id: "e90d35be-c02c-49c8-ac65-4558bf30bf59",
              columnName: "Etodolac",
              columnIndex: 22,
              subColumns: []
            }
          ]
        },
        {
          id: this.tableId,
          startingRow: 0,
          endingRow: 12,
          startingColumn: 0,
          endingColumn: 8,
          hasSubColumns: true,
          columns: [
            {
              id: this.MENTHHOL,
              columnName: "MENTHOL",
              columnIndex: 0,
              subColumns: [
                {
                  id: this.MENTHOL_SUBCOL_1,
                  subColumnIndex: 0,
                  name: "Overhold"
                },
                {
                  id: this.MENTHOL_SUBCOL_2,
                  subColumnIndex: 1,
                  name: "Ronstring"
                }
              ]
            },
            {
              id: this.BACITRACIN,
              columnName: "bacitracin zinc,neomycin sulfate, polymyxin b sulfate, pramoxine hcl",
              columnIndex: 2,
              subColumns: []
            },
            {
              id: this.OXYGEN,
              columnName: "oxygen",
              columnIndex: 3,
              subColumns: []
            },
            {
              id: this.EZETIMIBE,
              columnName: "ezetimibe and simvastatin",
              columnIndex: 4,
              subColumns: [
                {
                  id: this.EZETIMIBE_SUBCOL_1,
                  subColumnIndex: 0,
                  name: "Domainer"
                },
                {
                  id: this.EZETIMIBE_SUBCOL_2,
                  subColumnIndex: 1,
                  name: "Lotlux"
                },
                {
                  id: this.EZETIMIBE_SUBCOL_3,
                  subColumnIndex: 2,
                  name: "Wrapsafe"
                }
              ]
            },
            {
              id: this.CEFACLOR,
              columnName: "Cefaclor",
              columnIndex: 7,
              subColumns: []
            },
            {
              id: this.IBUPROFEN,
              columnName: "Ibuprofen",
              columnIndex: 8,
              subColumns: []
            }
          ]
        },
        {
          id: "f6d2579a-85c7-41e6-9749-832c1ba349a9",
          startingRow: 26,
          endingRow: 9,
          startingColumn: 7,
          endingColumn: 14,
          hasSubColumns: true,
          columns: [
            {
              id: "d849b87b-6d02-43c3-b382-7943478fc007",
              columnName: "Nystatin",
              columnIndex: 7,
              subColumns: [
                {
                  id: "61a81f06-5785-46b3-9261-8ea0dce30915",
                  subColumnIndex: 0,
                  name: "Treeflex"
                },
                {
                  id: "ab74cfd9-354e-46b2-9575-3494b8588a2b",
                  subColumnIndex: 1,
                  name: "It"
                },
                {
                  id: "9628e0e1-0d1f-4618-9f96-c3fe7c4d8ced",
                  subColumnIndex: 2,
                  name: "Home Ing"
                }
              ]
            },
            {
              id: "ec970c46-111f-41df-ac0b-cdc7afb51a7f",
              columnName: "Cefdinir",
              columnIndex: 10,
              subColumns: []
            },
            {
              id: "f3d611f5-48fe-4e3b-a049-25a88433c95e",
              columnName: "Number Three Weed Mixture",
              columnIndex: 11,
              subColumns: []
            },
            {
              id: "11f767da-b233-427b-94b4-20397267b639",
              columnName: "DEXTROSE MONOHYDRATE, SODIUM CHLORIDE, and POTASSIUM CHLORIDE",
              columnIndex: 12,
              subColumns: []
            },
            {
              id: "bfd02eb5-e2fd-4771-a7ec-c43804e03d73",
              columnName: "Asenapine Maleate",
              columnIndex: 13,
              subColumns: []
            },
            {
              id: "4c16bb9a-cbca-40df-baa4-b4da41571fb1",
              columnName: "Amoxicillin",
              columnIndex: 14,
              subColumns: []
            },
          ]
        }
      ],
      standaloneCells: []
    }
  ];

  constructor() {
  }

  getMockReports() {
    return this.mockReports;
  }

  getMockReport(i: number) {
    return this.mockReportData[i];
  }

  getSheet(id: string) {
    return this.sheets.find(s => s.id.toLowerCase() === id.toLowerCase());
  }

  getRows(sheetId: string) {
    return this.rows.filter(row => row.sheetId.toLowerCase() === sheetId.toLowerCase());
  }
}
