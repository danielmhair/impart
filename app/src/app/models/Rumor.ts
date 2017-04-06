export class Rumor {
  Rumor: {
    messageID?: string;
    Originator?: string;
    Text?: string;
  } = {};
  EndPoint: string = "";

  constructor(Rumor: { messageID: string, Originator: string, Text: string }, EndPoint: string) {
    this.Rumor.messageID = Rumor.messageID;
    this.Rumor.Originator = Rumor.Originator;
    this.Rumor.Text = Rumor.Text;
    this.EndPoint = EndPoint
  }
}
