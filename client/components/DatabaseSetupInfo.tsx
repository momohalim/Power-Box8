import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Info } from "lucide-react";

export function DatabaseSetupInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-blue-800">
          <Database className="w-5 h-5" />
          Database Setup Required
          <Badge variant="secondary">First Time Setup</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-blue-700">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium mb-2">
                Supabase tables are not set up yet.
              </p>
              <p className="text-sm text-blue-600 mb-3">
                The admin dashboard is using default data. To enable full
                functionality and data persistence, you need to create the
                required Supabase tables.
              </p>

              <div className="bg-white rounded-lg p-3 text-sm">
                <p className="font-medium text-gray-900 mb-2">
                  Required Tables:
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-700">
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      seo_settings
                    </code>{" "}
                    - For SEO & tracking data
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      product_popup
                    </code>{" "}
                    - For product popup content
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      exit_intent_popup
                    </code>{" "}
                    - For exit intent popup content
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      hero_section
                    </code>{" "}
                    - For hero section data
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      why_choose_section
                    </code>{" "}
                    - For why choose section
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      trust_section
                    </code>{" "}
                    - For trust indicators
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      product_popup
                    </code>{" "}
                    - For product modal content
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      exit_intent_popup
                    </code>{" "}
                    - For exit intent popup content
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      customer_reviews
                    </code>{" "}
                    - For customer reviews
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      offer_pricing
                    </code>{" "}
                    - For offer/pricing section
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">footer</code> -
                    For footer social links
                  </li>
                  <li>
                    <code className="bg-gray-100 px-1 rounded">
                      email_subscriptions
                    </code>{" "}
                    - For email collection
                  </li>
                </ul>
              </div>

              <p className="text-sm mt-3">
                <strong>Next Step:</strong> Connect to your Supabase project and
                create these tables, or the admin will continue using default
                values until tables are created.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
