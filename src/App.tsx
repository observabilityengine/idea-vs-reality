import { useCallback, useEffect, useState } from 'react';
import { Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import type { Memory } from './domain/memory';
import { orderMemories } from './domain/ordering';
import { parseMemory } from './domain/parser';
import { validateMemory } from './domain/validation';
import { completeMemory, createMemory, listActiveMemories, listCompletedMemories, restoreMemory } from './db/database';
import { AddMemory } from './components/AddMemory';
import { MemoryList } from './components/MemoryList';
import { theme } from './theme/theme';
export default function App() {
 const [memories,setMemories]=useState<Memory[]>([]); const [completed,setCompleted]=useState<Memory[]>([]); const [history,setHistory]=useState(false); const [error,setError]=useState<string|null>(null); const [undoId,setUndoId]=useState<string|null>(null);
 const refresh=useCallback(async()=>{try{const [active,done]=await Promise.all([listActiveMemories(),listCompletedMemories()]);setMemories(orderMemories(active));setCompleted(done);}catch(e){setError(e instanceof Error?e.message:'Unable to load memories.');}},[]);
 useEffect(()=>{void refresh();},[refresh]);
 const addMemory=async(input:string)=>{setError(null);const parsed=parseMemory(input);const validated=parsed?validateMemory(parsed):null;if(!validated){setError('Memory must contain text and be 500 characters or fewer.');return;}await createMemory(validated);await refresh();};
 const finishMemory=async(id:string)=>{try{setError(null);await completeMemory(id);setUndoId(id);await refresh();}catch(e){setError(e instanceof Error?e.message:'Unable to complete memory.');}};
 const undo=async()=>{if(!undoId)return;try{await restoreMemory(undoId);setUndoId(null);await refresh();}catch(e){setError(e instanceof Error?e.message:'Unable to restore memory.');}};
 return <GestureHandlerRootView style={styles.root}><SafeAreaView style={styles.safeArea}><View style={styles.header}><Text style={styles.title}>Head Check</Text><Pressable onPress={()=>setHistory(v=>!v)} accessibilityRole="button"><Text style={styles.history}>{history?'Active':`History${completed.length?` (${completed.length})`:''}`}</Text></Pressable></View>{error&&<View accessibilityRole="alert" style={styles.error}><Text style={styles.errorText}>{error}</Text></View>}{history?<MemoryList memories={completed} onComplete={()=>undefined} history/>:<MemoryList memories={memories} onComplete={id=>void finishMemory(id)}/>} {!history&&<AddMemory onSubmit={addMemory} onError={setError}/>} {!history&&undoId&&<View style={styles.undo}><Text style={styles.undoText}>Completed</Text><Pressable onPress={()=>void undo()}><Text style={styles.undoAction}>Undo</Text></Pressable></View>}</SafeAreaView></GestureHandlerRootView>;
}
const styles=StyleSheet.create({root:{flex:1},safeArea:{flex:1,backgroundColor:theme.colors.background},header:{paddingHorizontal:theme.spacing.page,paddingTop:12,paddingBottom:8,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},title:{color:theme.colors.text,fontSize:30,fontWeight:'600'},history:{color:theme.colors.secondaryText,fontSize:16},error:{marginHorizontal:theme.spacing.page,marginBottom:4,padding:10,borderRadius:10,backgroundColor:theme.colors.inputBackground},errorText:{color:theme.colors.text},undo:{marginHorizontal:theme.spacing.page,marginBottom:8,padding:12,borderRadius:12,backgroundColor:theme.colors.inputBackground,flexDirection:'row',justifyContent:'space-between'},undoText:{color:theme.colors.secondaryText},undoAction:{color:theme.colors.text,fontWeight:'700'}});
