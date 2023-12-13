"use client";

import LineageView from "@/components/lineage/LineageView";
import {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  ChakraProvider,
  Box,
} from "@chakra-ui/react";
import { useParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import * as amplitude from "@amplitude/analytics-browser";
import { QueryClientProvider } from "@tanstack/react-query";
import { reactQueryClient } from "@/lib/api/axiosClient";
import { useVersionNumber } from "@/lib/api/version";
import { setLocationHash, getLocationHash } from "@/lib/UrlHash";
import { RecceQueryContextProvider } from "@/lib/hooks/RecceQueryContext";
import { CheckView } from "@/components/check/CheckView";
import { QueryPage } from "@/components/query/QueryPage";

function getCookie(key: string) {
  var b = document.cookie.match("(^|;)\\s*" + key + "\\s*=\\s*([^;]+)");
  return b ? b.pop() : "";
}

const TabContainer = ({
  children,
  pageHeight,
}: {
  children: React.ReactNode;
  pageHeight: string;
}) => {
  return (
    <TabPanel p={0} h={pageHeight} maxH={pageHeight} overflow="auto">
      {children}
    </TabPanel>
  );
};

export default function Home() {
  const version = useVersionNumber();
  const params = useParams();
  const [urlHash, setUrlHash] = useState(getLocationHash());
  const [tabIndex, setTabIndex] = useState(0);

  useLayoutEffect(() => {
    const userId = getCookie("recce_user_id");
    if (userId && process.env.AMPLITUDE_API_KEY) {
      try {
        // Initialize Amplitude
        amplitude.init(process.env.AMPLITUDE_API_KEY, userId, {
          defaultTracking: true,
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleTabsChange = (index: number) => {
    if (index === 0) {
      setLocationHash("lineage");
    } else if (index === 1) {
      setLocationHash("query");
    } else if (index === 2) {
      setLocationHash("checks");
    }
    setTabIndex(index);
  };

  useEffect(() => {
    const hash = getLocationHash();
    setUrlHash(hash);

    if (hash !== urlHash) return;

    if (hash === "lineage") {
      setTabIndex(0);
    } else if (hash === "query") {
      setTabIndex(1);
    } else if (hash === "checks") {
      setTabIndex(2);
    } else {
      setTabIndex(0);
    }
  }, [params, urlHash]);

  const pageHeight = "calc(100vh - 42px)";

  return (
    <ChakraProvider>
      <RecceQueryContextProvider>
        <QueryClientProvider client={reactQueryClient}>
          <Tabs index={tabIndex} onChange={handleTabsChange}>
            <TabList>
              <Tab>Lineage</Tab>
              <Tab>Query</Tab>
              <Tab>Checks</Tab>
              <Box position="absolute" right="0" top="0" p="2" color="gray.500">
                {version}
              </Box>
            </TabList>

            <TabPanels>
              <TabContainer pageHeight={pageHeight}>
                <LineageView />
              </TabContainer>
              <TabContainer pageHeight={pageHeight}>
                <QueryPage />
              </TabContainer>
              <TabContainer pageHeight={pageHeight}>
                <CheckView />
              </TabContainer>
            </TabPanels>
          </Tabs>
        </QueryClientProvider>
      </RecceQueryContextProvider>
    </ChakraProvider>
  );
}
