import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export default function ItemMaster() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 py-6">
      <Card className="w-full max-w-2xl p-6 shadow-lg rounded-2xl">
        <CardContent className="space-y-5">
          <h2 className="text-2xl font-bold text-center">Item Master</h2>

          {[
            ["Item Name", "name"],
            ["Batch Number", "batchnumber"],
            ["Expiry Date", "expirydate", "date"],
            ["Manufacturer", "manufacturer"],
            ["GST Rate (%)", "gstrate"],
            ["HSN Code", "hsncode"],
            ["Price (₹)", "price"],
            ["Discount (%)", "discount"],
            ["Stock Quantity", "stockquantity"],
            ["Unit", "unit"],
            ["Business ID", "businessid"],
          ].map(([label, id, type = "text"]) => (
            <div key={id} className="space-y-1">
              <Label htmlFor={id}>{label}</Label>
              <Input id={id} type={type} placeholder={`Enter ${label.toLowerCase()}`} />
            </div>
          ))}

          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Enter description..." />
          </div>

          <Button className="w-full">Save Item</Button>
        </CardContent>
      </Card>
    </div>
  );
}
