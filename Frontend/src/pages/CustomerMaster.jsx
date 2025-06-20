import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function CustomerMaster() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6">
      <Card className="w-full max-w-2xl p-6 shadow-lg rounded-2xl">
        <CardContent className="space-y-5">
          <h2 className="text-2xl font-bold text-center">Customer Master</h2>

          {[
            ["Name", "name"],
            ["Age", "age", "number"],
            ["Contact Number", "contactNumber"],
            ["Visits", "visits", "number"],
            ["Customer ID", "customerID"],
            ["Date", "date", "date"],
            ["Quantity", "quantity", "number"],
          ].map(([label, id, type = "text"]) => (
            <div key={id} className="space-y-1">
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} type={type} placeholder={`Enter ${label.toLowerCase()}`} />
            </div>
          ))}

          <div className="space-y-1">
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" placeholder="Enter address..." />
          </div>

          <div className="space-y-1">
            <Label htmlFor="prescribeditems">Prescribed Items</Label>
            <Textarea id="prescribeditems" placeholder="Enter prescribed items..." />
          </div>

          <Button className="w-full">Save Customer</Button>
        </CardContent>
      </Card>
    </div>
  );
}
