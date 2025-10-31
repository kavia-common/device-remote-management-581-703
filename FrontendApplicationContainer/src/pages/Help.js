import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActionArea,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Router as SNMPIcon,
  Storage as WebPAIcon,
  Cloud as TR69Icon,
  CloudQueue as TR369Icon,
  Help as HelpIcon,
  Info as InfoIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
/**
 * Help page component providing comprehensive documentation and quick access to protocol information
 */
const Help = () => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState('getting-started');

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const protocolCards = [
    {
      title: 'SNMP',
      icon: <SNMPIcon fontSize="large" color="primary" />,
      description: 'Simple Network Management Protocol for network device monitoring and management',
      operations: ['GET', 'SET', 'WALK'],
      path: '/protocols/snmp',
    },
    {
      title: 'WebPA',
      icon: <WebPAIcon fontSize="large" color="primary" />,
      description: 'Web Protocol Adapter for TR-181 parameter management',
      operations: ['GET', 'SET'],
      path: '/protocols/webpa',
    },
    {
      title: 'TR-69',
      icon: <TR69Icon fontSize="large" color="primary" />,
      description: 'TR-069 ACS protocol for CPE remote management',
      operations: ['Get Parameters', 'Set Parameters'],
      path: '/protocols/tr69',
    },
    {
      title: 'TR-369',
      icon: <TR369Icon fontSize="large" color="primary" />,
      description: 'TR-369 USP (User Services Platform) for IoT device management',
      operations: ['GET', 'SET'],
      path: '/protocols/tr369',
    },
  ];

  const faqItems = [
    {
      question: 'How do I add a new device?',
      answer: 'Navigate to the Devices page and click the "Add Device" button. Fill in the required information including device name, IP address, protocol type, and authentication credentials.',
    },
    {
      question: 'What is a Query Job?',
      answer: 'Query jobs are asynchronous operations that run in the background. When you submit a query, you receive a job ID that you can use to track the progress and retrieve results.',
    },
    {
      question: 'How do I save frequently used queries?',
      answer: 'Use the "Save as Favorite" button on any protocol page after configuring your query. You can then load saved favorites using the "Load Favorite" button.',
    },
    {
      question: 'What are the different SNMP operations?',
      answer: 'GET retrieves a specific OID value, SET modifies an OID value, and WALK retrieves all OIDs under a specified subtree.',
    },
    {
      question: 'How do I cancel a running query?',
      answer: 'If a query is still in progress, a "Cancel Query" button will appear. Click it to stop the query execution.',
    },
    {
      question: 'Can I export query results?',
      answer: 'Yes, query results can be exported in CSV or JSON format from the Query History page.',
    },
  ];

  return (
    <Box>
      <Box display="flex" alignItems="center" mb={3}>
        <HelpIcon fontSize="large" color="primary" sx={{ mr: 2 }} />
        <Box>
          <Typography variant="h4">Help & Documentation</Typography>
          <Typography variant="body2" color="textSecondary">
            Learn how to use the Device Remote Management Platform
          </Typography>
        </Box>
      </Box>

      {/* Quick Protocol Access */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Protocol Quick Access
        </Typography>
        <Typography variant="body2" color="textSecondary" paragraph>
          Click on a protocol to start managing devices
        </Typography>
        <Grid container spacing={2}>
          {protocolCards.map((protocol) => (
            <Grid item xs={12} sm={6} md={3} key={protocol.title}>
              <Card>
                <CardActionArea onClick={() => navigate(protocol.path)}>
                  <CardContent>
                    <Box display="flex" justifyContent="center" mb={2}>
                      {protocol.icon}
                    </Box>
                    <Typography variant="h6" align="center" gutterBottom>
                      {protocol.title}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" align="center" paragraph>
                      {protocol.description}
                    </Typography>
                    <Box display="flex" flexWrap="wrap" justifyContent="center" gap={0.5}>
                      {protocol.operations.map((op) => (
                        <Chip key={op} label={op} size="small" />
                      ))}
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Documentation Sections */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Getting Started Guide
        </Typography>
        
        <Accordion expanded={expanded === 'getting-started'} onChange={handleAccordionChange('getting-started')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Getting Started</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="1. Add Your Devices"
                  secondary="Navigate to the Devices page and register your network devices with protocol-specific credentials"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="2. Choose a Protocol"
                  secondary="Select the appropriate protocol page (SNMP, WebPA, TR-69, or TR-369) based on your device capabilities"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="3. Execute Operations"
                  secondary="Select a device, configure parameters or OIDs, and execute queries to retrieve or modify device data"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <CheckIcon color="success" />
                </ListItemIcon>
                <ListItemText
                  primary="4. Monitor Results"
                  secondary="Track query progress in real-time and view results once operations complete"
                />
              </ListItem>
            </List>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'snmp'} onChange={handleAccordionChange('snmp')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">SNMP Protocol</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              SNMP (Simple Network Management Protocol) is used for network device monitoring and management.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Operations:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="GET"
                  secondary="Retrieve the value of a specific OID"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="SET"
                  secondary="Modify the value of a writable OID"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="WALK"
                  secondary="Retrieve all OIDs under a specified subtree"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Example OID:</strong> 1.3.6.1.2.1.1.1.0 (System Description)
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'webpa'} onChange={handleAccordionChange('webpa')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">WebPA Protocol</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              WebPA (Web Protocol Adapter) provides a RESTful interface for TR-181 data model parameter management.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Operations:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="GET"
                  secondary="Retrieve parameter values from the device"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="SET"
                  secondary="Update parameter values on the device"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Example Parameter:</strong> Device.DeviceInfo.SoftwareVersion
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'tr69'} onChange={handleAccordionChange('tr69')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">TR-69 Protocol</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              TR-69 (Technical Report 069) is a CPE WAN Management Protocol used for remote management of customer-premises equipment.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Operations:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Get Parameters"
                  secondary="Retrieve parameter values using GetParameterValues RPC"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="Set Parameters"
                  secondary="Update parameter values using SetParameterValues RPC"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Example Parameter:</strong> InternetGatewayDevice.DeviceInfo.ModelName
            </Typography>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={expanded === 'tr369'} onChange={handleAccordionChange('tr369')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">TR-369 Protocol</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Typography variant="body2" paragraph>
              TR-369 USP (User Services Platform) is a next-generation protocol for managing IoT devices and services.
            </Typography>
            <Typography variant="subtitle2" gutterBottom>Operations:</Typography>
            <List dense>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="GET"
                  secondary="Retrieve data model object values"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon><InfoIcon fontSize="small" /></ListItemIcon>
                <ListItemText
                  primary="SET"
                  secondary="Update data model object values"
                />
              </ListItem>
            </List>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Example Path:</strong> Device.LocalAgent.SoftwareVersion
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Paper>

      {/* FAQ Section */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Frequently Asked Questions
        </Typography>
        {faqItems.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" color="textSecondary">
                {faq.answer}
              </Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>
    </Box>
  );
};

export default Help;
