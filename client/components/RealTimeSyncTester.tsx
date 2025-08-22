import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertCircle,
  Radio,
  Activity,
  Zap,
} from "lucide-react";

interface RealtimeEvent {
  id: string;
  timestamp: string;
  table: string;
  eventType: string;
  description: string;
}

export function RealTimeSyncTester() {
  const [isConnected, setIsConnected] = useState(false);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [channel, setChannel] = useState<any>(null);
  const [testInProgress, setTestInProgress] = useState(false);

  const addEvent = (table: string, eventType: string, description: string) => {
    const newEvent: RealtimeEvent = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      table,
      eventType,
      description,
    };
    setEvents((prev) => [newEvent, ...prev.slice(0, 9)]); // Keep last 10 events
  };

  const startListening = () => {
    if (channel) {
      supabase.removeChannel(channel);
    }

    const tables = [
      "hero_section",
      "customer_reviews",
      "offer_pricing",
      "footer",
    ];

    const newChannel = supabase
      .channel("realtime_test_channel")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "hero_section" },
        (payload) => {
          setIsConnected(true);
          addEvent(
            "hero_section",
            payload.eventType,
            `Hero section ${payload.eventType.toLowerCase()}`,
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_reviews" },
        (payload) => {
          setIsConnected(true);
          addEvent(
            "customer_reviews",
            payload.eventType,
            `Customer reviews ${payload.eventType.toLowerCase()}`,
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "offer_pricing" },
        (payload) => {
          setIsConnected(true);
          addEvent(
            "offer_pricing",
            payload.eventType,
            `Offer pricing ${payload.eventType.toLowerCase()}`,
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "footer" },
        (payload) => {
          setIsConnected(true);
          addEvent(
            "footer",
            payload.eventType,
            `Footer ${payload.eventType.toLowerCase()}`,
          );
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          setIsListening(true);
          addEvent("system", "CONNECTED", "Real-time subscription established");
        } else if (status === "CLOSED") {
          setIsListening(false);
          setIsConnected(false);
          addEvent("system", "DISCONNECTED", "Real-time subscription closed");
        }
      });

    setChannel(newChannel);
  };

  const stopListening = () => {
    if (channel) {
      supabase.removeChannel(channel);
      setChannel(null);
    }
    setIsListening(false);
    setIsConnected(false);
    addEvent("system", "STOPPED", "Real-time listening stopped");
  };

  const triggerTestUpdate = async () => {
    setTestInProgress(true);
    try {
      // Make a small test update to hero_section
      const { error } = await supabase
        .from("hero_section")
        .update({
          updated_at: new Date().toISOString(),
        })
        .eq(
          "id",
          (await supabase.from("hero_section").select("id").limit(1)).data?.[0]
            ?.id,
        );

      if (error) {
        addEvent("test", "ERROR", `Test update failed: ${error.message}`);
      } else {
        addEvent(
          "test",
          "TRIGGERED",
          "Test update sent - waiting for real-time notification",
        );
      }
    } catch (error) {
      addEvent("test", "ERROR", `Test update exception: ${error}`);
    }
    setTestInProgress(false);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  useEffect(() => {
    // Start listening on mount
    startListening();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "UPDATE":
        return <RefreshCw className="w-4 h-4 text-blue-500" />;
      case "DELETE":
        return <XCircle className="w-4 h-4 text-red-500" />;
      case "CONNECTED":
        return <Wifi className="w-4 h-4 text-green-500" />;
      case "DISCONNECTED":
        return <WifiOff className="w-4 h-4 text-red-500" />;
      case "TRIGGERED":
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case "ERROR":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getEventBadgeColor = (eventType: string) => {
    switch (eventType) {
      case "INSERT":
        return "bg-green-100 text-green-800";
      case "UPDATE":
        return "bg-blue-100 text-blue-800";
      case "DELETE":
        return "bg-red-100 text-red-800";
      case "CONNECTED":
        return "bg-green-100 text-green-800";
      case "DISCONNECTED":
        return "bg-red-100 text-red-800";
      case "TRIGGERED":
        return "bg-yellow-100 text-yellow-800";
      case "ERROR":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Radio className="w-5 h-5" />
          Real-time Sync Tester
          <div className="ml-auto flex items-center gap-2">
            {isListening ? (
              <Badge className="bg-green-100 text-green-800 flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Listening
              </Badge>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">Not Listening</Badge>
            )}
            {isConnected && (
              <Badge className="bg-blue-100 text-blue-800 flex items-center gap-1">
                <Wifi className="w-3 h-3" />
                Connected
              </Badge>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Controls */}
        <div className="flex gap-2 flex-wrap">
          <Button
            onClick={isListening ? stopListening : startListening}
            variant={isListening ? "destructive" : "default"}
            size="sm"
          >
            {isListening ? (
              <>
                <WifiOff className="w-4 h-4 mr-2" />
                Stop Listening
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4 mr-2" />
                Start Listening
              </>
            )}
          </Button>

          <Button
            onClick={triggerTestUpdate}
            disabled={!isListening || testInProgress}
            variant="outline"
            size="sm"
          >
            {testInProgress ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 mr-2" />
            )}
            Trigger Test Update
          </Button>

          <Button onClick={clearEvents} variant="outline" size="sm">
            Clear Events
          </Button>
        </div>

        <Separator />

        {/* Events List */}
        <div className="space-y-2">
          <h3 className="font-medium text-sm text-gray-700 flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Real-time Events ({events.length})
          </h3>

          {events.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Radio className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No real-time events received yet</p>
              <p className="text-sm">
                Make changes in the admin panel or trigger a test update
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  {getEventIcon(event.eventType)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">
                        {event.description}
                      </span>
                      <Badge
                        className={`text-xs ${getEventBadgeColor(event.eventType)}`}
                      >
                        {event.eventType}
                      </Badge>
                      {event.table !== "system" && event.table !== "test" && (
                        <Badge variant="outline" className="text-xs">
                          {event.table}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{event.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-medium text-blue-900 mb-2">
            How to Test Real-time Sync:
          </h4>
          <ol className="text-sm text-blue-800 space-y-1">
            <li>1. Click "Start Listening" if not already active</li>
            <li>2. Open another browser tab/window to this site</li>
            <li>
              3. Make changes in the admin panel or click "Trigger Test Update"
            </li>
            <li>4. Watch for real-time events to appear in this list</li>
            <li>5. Changes should sync immediately across all open tabs</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}
